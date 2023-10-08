/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateConvDto } from './dto/create-conv.dto';
import { UpdateConvDto } from './dto/update-conv.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conv, ConvDocument } from './entities/conv.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import * as fs from 'fs';
//service of conversation
@Injectable()
export class ConvService {
  constructor(
    //injecting the conversation model and other services
    @InjectModel(Conv.name)
    private ConvModel: Model<ConvDocument>,
    private readonly userService: UserService,
    private messageService: MessageService,
  ) {}
  /**
   *
   * @param id1 id of the first user
   * @param id2  id of the second user
   * @returns  true and the id of the conversation if the conversation exist between the two users, false and null if not
   */
  async convExistBetween(id1: string, id2: string) {
    //get all conversations
    const allConvs = await this.ConvModel.find().exec();
    //iterate over the conversations to find out if there is a conversation between the two users
    for (let i = 0; i < allConvs.length; i++) {
      const conv = allConvs[i];
      const members = conv.members;
      if (members.includes(id1) && members.includes(id2)) {
        return { bool: true, idConv: conv._id };
      }
    }
    return { bool: false, idConv: null };
  }
  /**
   *
   * @param idUser the id of the user
   * @returns  all conversations of the user
   */
  async convOfUser(idUser: string) {
    const myConvs = await this.ConvModel.find({
      members: { $in: [idUser] },
    }).exec();

    return myConvs;
  }
  /**
   *
   * @param createConvDto the conversation to create
   * @returns the conversation created
   */
  async create(createConvDto: CreateConvDto) {
    //check if the conversation exist between the two users
    const exist = await this.convExistBetween(
      createConvDto.members[0],
      createConvDto.members[1],
    );
    //return the conversation if it exist, create a new one if not
    if (exist.bool) {
      return await this.findOne(exist.idConv);
    } else {
      createConvDto.photo = process.env.api_url + '/user/uploads/user.png';
      createConvDto.status = 'online';
      const convCreated = await this.ConvModel.create(createConvDto);
      const newId = convCreated._id.toString();
      const finalConv = await this.findOne(newId);
      return finalConv;
    }
  }
  /**
   *
   * @param users users to add the option
   * @param myid the id of the user to found out the option to add
   * @returns the users with the option
   */
  async addOptionsToUsers(users: any[], myid: string): Promise<any[]> {
    //iterate over the users to add the option
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (user == null) {
        continue;
      }
      //check if the user is a friend, if he send a request, if he receive a request
      const fr = await this.userService.areFriends(myid, user._id);
      const iSend = await this.userService.alreadySend(myid, user._id);
      const heSend = await this.userService.alreadySend(user._id, myid);
      //set the option according to the result of the checks
      if (fr) {
        user.operation = 'remove';
      } else if (iSend) {
        user.operation = 'cancel';
      } else if (heSend) {
        user.operation = 'accept';
      } else if (!fr) {
        user.operation = 'add';
      }
    }

    return users;
  }
  /**
   *
   * @param idConv the id of the conversation
   * @param myId the id of the user to found out the option to add
   * @returns the members of the conversation with the option
   */
  async getMembers(idConv: string, myId: string) {
    let res: any[] = [];
    const conv: any = await this.findOne(idConv);
    const UserIds: string[] = conv.members;
    for (let i = 0; i < UserIds.length; i++) {
      const element = UserIds[i];
      const user: any = await this.userService.findOne(element);
      if (user == null) {
        continue;
      }
      user.addReqs = null;
      user.friends = null;
      res.push(user);
    }
    res = await this.addOptionsToUsers(res, myId);

    return res;
  }
  /**
   *
   * @param idConv the id of the conversation
   * @returns  the last message of the conversation
   */
  async getLastMessage(idConv: string) {
    //get all messages of the conversation
    const messages = await this.messageService.findAllMessageOfConv(idConv);
    if (messages.length == 0) {
      return null;
    } else {
      //return the last message
      return messages[messages.length - 1];
    }
  }
  /**
   *
   * @param id the id of the user
   * @returns  all conversations of the user with the name and the image
   */
  async getMyConvs(id: string) {
    //set the user online
    await this.userService.setStatus(id, { status: 'online' });
    //get all conversations of the user
    const myConvs = await this.convOfUser(id);

    if (myConvs.length == 0) {
      return [];
    }
    //iterate over the convs to set the name and the image
    for (let i = 0; i < myConvs.length; i++) {
      const conv = myConvs[i];

      //set the members
      const membersId = conv.members;
      const members = [];
      for (const memberId of membersId) {
        const user = await this.userService.findOne(memberId);
        if (user == null) {
          continue;
        } else {
          members.push(user);
        }
      }
      conv.members = members;
      //set last message
      const lasMessage = await this.getLastMessage(conv._id.toString());
      conv.lastMessage = lasMessage;

      /**
       * set the name,
       * if the conv is a group chat, the name is 'Group chat',
       * if the conv is a conversation with one person,
       *  the name is the name of the person,
       * if the conv is a conversation with more than one person,
       *  the name is the name of the first person in the conversation who is not the current user
       *
       */
      if (members.length > 2) {
        conv.name = 'Group chat';
      } else if (members.length == 1) {
        const me = await this.userService.findOne(id);
        conv.name = me.firstName + ' ' + me.lastName;
      } else {
        if ((members.length = 2)) {
          if (members[0]._id == id) {
            const friend = await this.userService.findOne(members[1]);

            if (friend != null) {
              conv.name = friend.firstName + ' ' + friend.lastName;
            } else {
              const me = await this.userService.findOne(id);
              conv.name = me.firstName + ' ' + me.lastName;
            }
          } else {
            const friend = await this.userService.findOne(members[0]);
            if (friend != null) {
              conv.name = friend.firstName + ' ' + friend.lastName;
            } else {
              const me = await this.userService.findOne(id);
              conv.name = me.firstName + ' ' + me.lastName;
            }
          }
        }
      }

      /**
       * set the conv image,
       * if the conv is a group chat,
       * the image is 'assets/images/group.png',
       * if the conv is a conversation with one person,
       * the image is the image of the person,
       * if the conv is a conversation with more than one person,
       * the image is the image of the first person in the conversation who is not the current user
       */
      if (members.length == 1) {
        const me = await this.userService.findOne(id);
        conv.photo = me.photo;
      }
      if (members.length > 2) {
        if (
          conv.photo == undefined ||
          conv.photo == null ||
          conv.photo == ' ' ||
          conv.photo == ''
        ) {
          conv.photo = process.env.api_url + '/user/uploads/group.png';
        }
      }
      if (members.length == 2) {
        if (members[0]._id == id) {
          const friend = await this.userService.findOne(members[1]);
          if (friend == null || friend.photo == undefined) {
            conv.photo = ' ';
          } else {
            conv.photo = friend.photo;
          }
        } else {
          const friend = await this.userService.findOne(members[0]);
          if (friend == null || friend.photo == undefined) {
            conv.photo = ' ';
          } else {
            conv.photo = friend.photo;
          }
        }
      }
    }

    return myConvs;
  }
  /**
   *
   * @returns all conversations
   */
  findAll() {
    return this.ConvModel.find().exec();
  }
  /**
   *
   * @param key key word to search conversations by name
   * @param myid  the id of the user(search in his conversations)
   * @returns   conversations that contain the key word in their name or in the name of one of their members
   */
  async searched(key: string, myid: string): Promise<any> {
    //res is a set to avoid duplicates
    const res = new Set();
    const convs: Conv[] = await this.getMyConvs(myid);
    //iterate over the convs to find out if the name of the conv or the name of one of its members contains the key word
    for (let i = 0; i < convs.length; i++) {
      const conv = convs[i];
      const nameConv = conv.name.toLowerCase();
      if (nameConv.includes(key.toLowerCase())) {
        res.add(conv);
      }
      //iterate over the members to find out if the name of one of them contains the key word
      const members: string[] = conv.members;
      for (let j = 0; j < members.length; j++) {
        const member = members[j];
        const user = await this.userService.findOne(member);
        const nameUser = user.firstName + ' ' + user.lastName;
        if (nameUser.includes(key)) {
          res.add(conv);
        }
      }
    }

    return Array.from(res);
  }
  /**
   *
   * @param id the id of the conversation
   * @returns  the conversation with the name and the image
   */
  async findOne(id: string) {
    const conv = await this.ConvModel.findOne({ _id: id }).exec();
    const members: any = conv.members;

    //set name
    if (conv.name == undefined) {
      if (members.length > 2) {
        conv.name = 'Group chat';
      } else if (members.length == 1) {
        conv.name = 'Saved messages';
      } else {
        if (members[0] == id) {
          const friend = await this.userService.findOne(members[1]);
          if (friend == null) {
            const friend = await this.userService.findOne(members[0]);
            conv.name = friend.firstName + ' ' + friend.lastName;
          }
          conv.name = friend.firstName + ' ' + friend.lastName;
        } else {
          const friend = await this.userService.findOne(members[0]);
          if (friend == null) {
            const friend = await this.userService.findOne(members[1]);

            conv.name = friend.firstName + ' ' + friend.lastName;
          }
          conv.name = friend.firstName + ' ' + friend.lastName;
        }
      }
    }

    return conv;
  }

  /**
   *
   * @param id the id of the conversation
   * @param updateConvDto  the conversation to update
   * @returns  the conversation updated
   */
  async update(id: string, updateConvDto: UpdateConvDto) {
    await this.ConvModel.updateOne({ _id: id }, updateConvDto).exec();
    const conv = await this.findOne(id);
    return conv;
  }
  /**
   *
   * @param id the id of the conversation
   * @param photo  the photo to update
   * @returns  the photo updated's name
   */
  async updatePhoto(id: string, photo: any) {
    const conv = await this.findOne(id);
    let oldPhoto = conv.photo;
    const nameOldPhotoSplit = oldPhoto.split('/');
    oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
    fs.access('assets/imagesOfConvs/' + oldPhoto, fs.constants.F_OK, (err) => {
      if (err) {
        // Handle the case where the file does not exist
      } else {
        fs.unlink('assets/imagesOfConvs/' + oldPhoto, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
        // Handle the case where the file exists
      }
    });
    const photoName = process.env.api_url + '/user/uploads/' + photo.filename;
    await this.ConvModel.updateOne({ _id: id }, { photo: photoName });
    return { photo: photoName };
  }

  /**
   *
   * @param id the id of the conversation
   * @returns  the conversation deleted
   */
  async remove(id: string): Promise<any> {
    const conv = await this.findOne(id);
    let oldPhoto = conv.photo;
    const nameOldPhotoSplit = oldPhoto.split('/');
    oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
    if (
      oldPhoto != process.env.defaultUserPhoto &&
      oldPhoto != process.env.defaultGroupPhoto
    ) {
      fs.access(
        'assets/imagesOfConvs/' + oldPhoto,
        fs.constants.F_OK,
        (err) => {
          if (err) {
            // Handle the case where the file does not exist
          } else {
            fs.unlink('assets/imagesOfConvs/' + oldPhoto, (err) => {
              if (err) {
                console.error(err);
                return;
              }
            });
            // Handle the case where the file exists
          }
        },
      );
    }
    await this.messageService.removeAllFromConv(id);
    return this.ConvModel.deleteMany({ _id: id }).exec();
  }
  /**
   * delete all conversations
   * @returns all conversations deleted
   */
  removeAll(): any {
    return this.ConvModel.deleteMany().exec();
  }
  /**
   *
   * @param id the id of the user
   * @param idConv  the id of the conversation
   * @returns  the conversation deleted if the user is the last member, the conversation updated if not
   */
  async leaveConv(id: string, idConv: string): Promise<any> {
    const conv = await this.findOne(idConv);
    const members = conv.members;
    members.splice(members.indexOf(id), 1);
    if (members.length == 0) {
      return this.remove(idConv);
    } else {
      return await this.update(conv._id, { members: members });
    }
  }
  /**
   * to use when a user delete his account
   * @param id the id of the user
   */
  async leaveAllConv(id: string): Promise<any> {
    const convs = await this.convOfUser(id);
    for (let i = 0; i < convs.length; i++) {
      this.leaveConv(id, convs[i]._id);
    }
  }
}
