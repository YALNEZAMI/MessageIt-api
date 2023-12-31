/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateConvDto } from './dto/create-conv.dto';
// import { UpdateConvDto } from './dto/update-conv.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conv, ConvDocument } from './entities/conv.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import * as fs from 'fs';
import { SessionService } from 'src/session/session.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';
import { UpdateConvDto } from './dto/update-conv.dto';
//service of conversation
@Injectable()
export class ConvService {
  constructor(
    //injecting the conversation model and other services
    @InjectModel(Conv.name)
    private ConvModel: Model<ConvDocument>,
    private readonly userService: UserService,
    private messageService: MessageService,
    private sessionService: SessionService,
    private webSocketsService: WebSocketsService,
  ) {}
  /**
   * @Param a conversation with members ids
   * @returns a conversation with members
   */
  async fillMembers(conv: any) {
    const members: any[] = [];
    conv.members = await Promise.all(
      conv.members.map(async (id: string) => {
        const user = await this.userService.findConfidentialUser(id);
        if (user != null) members.push(user);
      }),
    );
    conv.members = members;
    return conv;
  }
  /**
   *
   * @param id1 id of the first user
   * @param id2  id of the second user
   * @returns  true and the id of the conversation if the conversation exist between the two users, false and null if not
   */
  async convExistBetween(
    id1: string,
    id2: string,
  ): Promise<{
    bool: boolean;
    conv: any;
  }> {
    //get all conversations
    const conv = await this.ConvModel.findOne({
      $and: [
        { type: { $ne: 'groupe' } },
        { members: { $in: [id1] } },
        { members: { $in: [id2] } },
        { members: { $size: 2 } },
      ],
    }).exec();
    //iterate over the conversations to find out if there is a conversation between the two users
    if (conv == null) {
      return { bool: false, conv: null };
    } else {
      return { bool: true, conv: conv };
    }
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
    if (
      !this.userService.areFriends(
        createConvDto.members[0],
        createConvDto.members[1],
      )
    ) {
      return {
        error:
          "you can't create a conversation with a user that you are not friends with",
      };
    }
    if (createConvDto.type == 'private') {
      createConvDto.name = '';
    }
    //set theme
    if (createConvDto.theme == undefined) {
      createConvDto.theme = 'basic';
    }
    //check if the conversation exist between the two users
    const exist = await this.convExistBetween(
      createConvDto.members[0],
      createConvDto.members[1],
    );
    //return the conversation if it exist, create a new one if not
    if (exist.bool) {
      exist.conv = await this.fillMembers(exist.conv);
      return exist.conv;
    } else {
      //set description if doesn't exist
      if (createConvDto.description == undefined) {
        createConvDto.description = '';
      }
      createConvDto.photo = process.env.api_url + '/user/uploads/user.png';
      //set type
      if (createConvDto.members.length > 2) {
        createConvDto.type = 'groupe';
        createConvDto.admins = [];
      } else {
        createConvDto.type = 'private';
      }
      const convCreated = await this.ConvModel.create(createConvDto);
      const newId = convCreated._id.toString();

      let finalConv = await this.ConvModel.findOne({ _id: newId }, {}).exec();
      finalConv = await this.fillMembers(finalConv);
      //set name of groupe if empty
      // finalConv = await this.setNameAndPhoto(finalConv,createConvDto.members[0]);

      //set websocket to notifiy the members of the new conversation
      this.webSocketsService.OnCreateConv(finalConv);
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
    users = await Promise.all(
      users.map(async (user) => {
        if (user != null) {
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
        return user;
      }),
    );

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
    if (conv == null) return null;
    const UserIds: string[] = conv.members;
    await Promise.all(
      UserIds.map(async (element) => {
        const user: any = await this.userService.findConfidentialUser(element);
        if (user != null) {
          res.push(user);
        }
      }),
    );
    res = await this.addOptionsToUsers(res, myId);
    return res;
  }
  /**
   *
   * @param idConv the id of the conversation
   * @returns  the last message of the conversation
   */
  async getLastMessage(idConv: string, idUser: string) {
    return await this.messageService.getLastMessage(idConv, idUser);
  }

  /**
   *
   * @param id the id of the user
   * @returns  all conversations of the user with the name and the image
   */
  async getMyConvs(id: string) {
    //set the user online
    await this.sessionService.setStatusOnline(id);
    //get all conversations of the user
    let myConvs: any = await this.convOfUser(id);

    //iterate over the convs to set the name and the image
    myConvs = await Promise.all(
      myConvs.map(async (conv: any) => {
        //set the members
        conv = await this.fillMembers(conv);
        //set operation to members
        conv.members = await this.addOptionsToUsers(conv.members, id);
        //set name and photo
        conv = await this.setNameAndPhoto(conv, id);
        //set last message
        const lastMessage = await this.getLastMessage(conv._id.toString(), id);
        const messages = await this.messageService.findMessageOfConv(
          conv._id.toString(),
          id,
        );
        conv.messages = messages;
        //set medias
        const medias = await this.messageService.getMedias(
          conv._id.toString(),
          id,
        );
        conv.medias = medias;
        //set last message as recieved
        if (lastMessage != null) {
          const lastMessageFinal = await this.messageService.setRecievedBy({
            idReciever: id,
            idMessage: lastMessage._id.toString(),
          });

          conv.lastMessage = lastMessageFinal;

          //set notif web socket
          this.webSocketsService.onRecievedMessage(lastMessageFinal);
        }
        return conv;
      }),
    );
    //sort convs by the last message date
    myConvs.sort((a: any, b: any) => {
      // Get the last message date, or createdAt if there's no last message
      const aDate = a.lastMessage ? a.lastMessage.date : a.createdAt;
      const bDate = b.lastMessage ? b.lastMessage.date : b.createdAt;
      return bDate - aDate;
    });
    return myConvs;
  }
  /**
   * @param conv
   * @return conv with name and image adapted to the user
   */
  async setNameAndPhoto(conv: any, id: string) {
    //groupe case
    if (conv.type == 'groupe') return conv;
    const me = await this.userService.findOne(id);
    //lonley case
    if (conv.members.length == 1) {
      conv.name = me.firstName + ' ' + me.lastName;
      conv.photo = me.photo;
      return conv;
    }
    //two members case and private case
    if ((conv.members.length = 2)) {
      if (conv.members[0]._id == id) {
        const friend = await this.userService.findOne(conv.members[1]);

        if (friend != null) {
          conv.name = friend.firstName + ' ' + friend.lastName;
          conv.photo = friend.photo;
        } else {
          conv.name = me.firstName + ' ' + me.lastName;
          conv.photo = me.photo;
        }
      } else {
        const friend = await this.userService.findOne(conv.members[0]);
        if (friend != null) {
          conv.name = friend.firstName + ' ' + friend.lastName;
          conv.photo = friend.photo;
        } else {
          conv.photo = me.photo;
          conv.name = me.firstName + ' ' + me.lastName;
        }
      }
    }

    return conv;
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
    //iterate over the convs to find out if the name of the conv
    await Promise.all(
      convs.map(async (conv) => {
        const nameConv = conv.name.toLowerCase();
        if (nameConv.includes(key.toLowerCase())) {
          res.add(conv);
        }
        //iterate over the members to find out if the name of one of them contains the key word
        conv.members = await Promise.all(
          conv.members.map(async (member: string) => {
            const user = await this.userService.findOne(member);
            const nameUser = user.firstName + ' ' + user.lastName;
            if (nameUser.includes(key) && member != myid) {
              res.add(conv);
            }
            return member;
          }),
        );
        return conv;
      }),
    );

    return Array.from(res);
  }
  /**
   *
   * @param id the id of the conversation
   * @returns  the conversation with the name and the image
   */
  async findOne(id: string) {
    const conv = await this.ConvModel.findOne({ _id: id }).exec();
    if (conv == null) return null;
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
  async update(id: string, object: any, file: Express.Multer.File) {
    const admin = JSON.parse(object.admin);

    let conv = await this.findOne(id);
    //before filling members ,we get the visibility for notifs in Conv
    const visibility = conv.members;
    //fill members objects
    conv = await this.fillMembers(conv);
    //set operations
    conv.members = await this.addOptionsToUsers(conv.members, admin._id);

    const updateConvDto: UpdateConvDto = JSON.parse(object.conv);
    updateConvDto.members = visibility; //get ids not objects
    if (conv.type == 'private') {
      updateConvDto.name = '';
    }
    if (updateConvDto.name != conv.name) {
      //update db conv name
      conv.name = updateConvDto.name;
      //create a message to notify the change of name
      await this.messageService.createNotif({
        visibility: visibility,
        conv: id,
        maker: admin._id,
        typeMsg: 'notif',
        sous_type: 'convNameChanged',
        reciever: '',
        recievedBy: [object.admin._id],
      });
    }

    if (updateConvDto.description != conv.description) {
      //update db conv description
      conv.description = updateConvDto.description;

      //create a message to notify the change of description
      await this.messageService.createNotif({
        visibility: visibility,
        conv: id,
        maker: admin._id,
        typeMsg: 'notif',
        sous_type: 'convDescriptionChanged',
        reciever: '',
        recievedBy: [object.admin._id],
      });
    }
    if (updateConvDto.theme != conv.theme) {
      //update db conv theme
      conv.theme = updateConvDto.theme;
      //create a message to notify the change of theme
      await this.messageService.createNotif({
        visibility: visibility,
        conv: id,
        maker: admin._id,
        typeMsg: 'notif',
        sous_type: 'convThemeChanged',
        reciever: '',
        recievedBy: [object.admin._id],
      });
    }
    //no photo case
    if (file == undefined) {
      //update in db
      await this.ConvModel.updateOne({ _id: id }, updateConvDto).exec();

      //set websocket notif convChanged
      this.webSocketsService.someConvChanged(conv);
      return conv;
    } else {
      //photo case
      //create a message to notify the change of photo
      await this.messageService.createNotif({
        visibility: visibility,
        conv: id,
        maker: admin._id,
        typeMsg: 'notif',
        sous_type: 'convPhotoChanged',
        reciever: '',
        recievedBy: [object.admin._id],
      });
      const filepath = process.env.api_url + '/user/uploads/' + file.filename;
      //get the photo url and update the conv
      updateConvDto.photo = filepath;
      //getting old conv and old photo path to delete it
      const oldPhoto = conv.photo;
      //update db conv photo path
      conv.photo = filepath;
      //updating in db
      await this.ConvModel.updateOne({ _id: id }, updateConvDto).exec();
      //remove old photo
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
              }
            });
          }
        },
      );
      //set websocket notif convChanged

      this.webSocketsService.someConvChanged(conv);
      return conv;
    }
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
    //remove all messages of the conversation
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
    //get leaver
    const leaver = await this.userService.findConfidentialUser(id);

    //make messages not visible any more
    await this.messageService.pullFromVisibilityOfConv(idConv, id);
    //set conv notifs
    let conv: any = await this.ConvModel.findById(idConv);
    if (conv == null) return { error: 'conv not found' };
    conv = await this.fillMembers(conv);

    conv.members = conv.members.filter((member: any) => member._id != id);
    const membersIds = conv.members.map((member: any) => member._id.toString());
    const visibility = membersIds;
    const notif = {
      visibility: visibility,
      conv: idConv,
      maker: id,
      typeMsg: 'notif',
      sous_type: 'leaveConv',
      reciever: '',
      recievedBy: [],
    };
    await this.messageService.createNotif(notif);

    if (conv.members.length == 0) {
      await this.remove(idConv);
      this.webSocketsService.onLeavingConv({
        conv: conv,
        leaver: leaver,
      });
    } else {
      //chef is leaver case
      if (leaver._id.toString() == conv.chef) {
        await this.ConvModel.updateOne(
          { _id: idConv },
          {
            chef: membersIds[0],
            members: membersIds,
            $pull: { admins: id },
          },
        );
        conv.chef = membersIds[0];
      } else {
        await this.ConvModel.updateOne(
          { _id: idConv },
          {
            members: membersIds,
            $pull: { admins: id },
          },
        );
      }

      conv = await this.setNameAndPhoto(conv, id);
      //set websocket to notify the members of the new members
      this.webSocketsService.onLeavingConv({
        conv: conv,
        leaver: leaver,
      });
      return conv;
    }
  }
  /**
   * to use when a user delete his account
   * @param id the id of the user
   */
  async leaveAll(id: string): Promise<any> {
    const convs = await this.convOfUser(id);
    await Promise.all(
      convs.map(async (conv) => {
        await this.leaveConv(id, conv._id);
      }),
    );
  }
  async makeGroupe(conv: any) {
    conv.photo = process.env.api_url + '/user/uploads/group.png';
    conv.lastMessage = null;
    if (conv.name == '') {
      conv.name = 'Group chat';
    }
    conv.description = 'Write a description...';
    conv.theme = 'basic';
    let finaleConv: any = await this.ConvModel.create(conv);
    //set web socket
    finaleConv = await this.fillMembers(finaleConv);
    this.webSocketsService.OnCreateConv(finaleConv);
    return finaleConv;
  }
  typing(object: any) {
    this.webSocketsService.typing(object);
  }
  async removeFromGroupe(idUser: string, idAdmin: string, idConv: string) {
    let conv = await this.findOne(idConv);
    //checks
    if (
      conv.chef == idAdmin ||
      (conv.admins.includes(idAdmin) &&
        !conv.admins.includes(idUser) &&
        conv.chef != idUser &&
        idAdmin != idUser &&
        conv.members.includes(idUser))
    ) {
      await this.ConvModel.updateOne(
        { _id: idConv },
        { $pull: { members: idUser, admins: idUser } },
      ).exec();

      conv.members.splice(conv.members.indexOf(idUser), 1);
      //set members
      conv = await this.fillMembers(conv);
      //set operations
      conv.members = await this.addOptionsToUsers(conv.members, idAdmin);
      //set websocket notif
      this.webSocketsService.onRemoveFromGroupe({
        idUser: idUser,
        conv: conv,
      });
      //set conv notifs
      const visibility = conv.members.map((member: any) => member._id);
      await this.messageService.createNotif({
        visibility: visibility,
        conv: idConv,
        maker: idAdmin,
        reciever: idUser,
        typeMsg: 'notif',
        sous_type: 'removeMember',
        recievedBy: [idAdmin],
      });
      //make messages not visible any more
      await this.messageService.pullFromVisibilityOfConv(idConv, idUser);
      return conv;
    } else {
      return conv;
    }
  }
  /**
   * @param id the id of the conversation
   * @param members the members to add
   * @returns the conversation updated
   */
  async addMembers(idConv: string, members: string[], idAdmin: string) {
    let conv = await this.findOne(idConv);
    //some checks
    if (idAdmin != conv.chef && !conv.admins.includes(idAdmin)) return conv;
    const initialMembers = conv.members;
    //use set to avoid duplicates
    const set = new Set();
    //set initial members
    initialMembers.map((member) => {
      set.add(member);
    });
    //add new members
    await Promise.all(
      members.map(async (member) => {
        set.add(member);
        //set conv notifs
        await this.messageService.createNotif({
          visibility: members.concat(initialMembers),
          conv: idConv,
          maker: idAdmin,
          reciever: member,
          typeMsg: 'notif',
          sous_type: 'addMember',
          recievedBy: [idAdmin],
        });
      }),
    );
    //update database
    await this.ConvModel.updateOne(
      { _id: idConv },
      { members: Array.from(set) },
    ).exec();
    conv.members = Array.from(set);
    conv = await this.fillMembers(conv);
    //set operations
    conv.members = await this.addOptionsToUsers(conv.members, idAdmin);

    //set websocket to notify the members of the new members
    const convAndNewMembers = {
      conv: conv,
      members: members,
    };
    this.webSocketsService.onAddMemberToGroupe(convAndNewMembers);
    return conv;
  }
  /**
   * @param body the body of the request
   * @returns the conversation updated
   */
  async upgradeToAdmin(body: any) {
    //body:{conv,user,admin}
    let conv = await this.findOne(body.conv._id);
    const admins = conv.admins;
    //check if the user operating the upgrading is the chef
    if (conv.chef != body.chef._id) return conv;
    //if permission is verified
    await this.ConvModel.updateOne(
      { _id: body.conv._id },
      {
        $addToSet: { admins: body.user._id },
      },
    );
    //set websocket to notify the members of the new admin
    conv.admins = [...admins, body.user._id];
    //set members

    conv = await this.fillMembers(conv);
    //set operations
    conv.members = await this.addOptionsToUsers(conv.members, body.chef._id);

    this.webSocketsService.upgardingToAdmin(conv);

    //set conv notifs
    const visibility = conv.members;
    //creating notif
    await this.messageService.createNotif({
      visibility: visibility,
      conv: body.conv._id,
      maker: body.chef._id,
      reciever: body.user._id,
      typeMsg: 'notif',
      sous_type: 'upgradeToAdmin',
      recievedBy: [body.admin._id],
    });
    return conv;
  }
  async upgradeToChef(body: any) {
    let conv = await this.findOne(body.conv._id);
    const user = body.user;
    const chef = body.chef;
    //cheks
    if (chef._id == conv.chef) {
      //chenges:user not admin if was,chef not chef but admin,user chef
      //remove new chef from admins
      if (conv.admins.includes(user._id)) {
        conv.admins = conv.admins.filter((admin: any) => admin != user._id);
      }
      //add old chef to admins
      conv.admins.push(conv.chef);
      //set new chef
      conv.chef = user._id;
      //update database
      await this.ConvModel.updateOne(
        { _id: body.conv._id },
        {
          chef: user._id,
          admins: conv.admins,
        },
      );
      //fill members
      conv = await this.fillMembers(conv);
      //set operations

      conv.members = await this.addOptionsToUsers(conv.members, body.chef._id);
      //set websocket to notify the members of the new chef

      this.webSocketsService.upgardingToChef(conv);
      //set conv notifs
      const visibility = conv.members;
      //creating notif
      await this.messageService.createNotif({
        visibility: visibility,
        conv: body.conv._id,
        maker: body.chef._id,
        reciever: body.user._id,
        typeMsg: 'notif',
        sous_type: 'upgradeToChef',
        recievedBy: [chef._id],
      });
      return conv;
    } else {
      return body.conv;
    }
  }
  async downgradeAdmin(body: any) {
    //body:{conv,user,admin}
    const conv: any = await this.findOne(body.conv._id);
    const admins = conv.admins;
    //check if the user operating the upgrading is the chef or if the user is already an admin
    if (conv.chef != body.chef._id || !admins.includes(body.user._id)) {
      return conv;
    } else {
      //if permission is verified
      await this.ConvModel.updateOne(
        { _id: body.conv._id },
        {
          admins: admins.filter((admin: string) => admin != body.user._id),
        },
      );
      //set websocket to notify the members of the new admin
      conv.admins = conv.admins.filter((admin: any) => admin != body.user._id);
      body.conv.admins = body.conv.admins.filter(
        (admin: string) => admin != body.user._id,
      );
      this.webSocketsService.downgardingAdmin(body.conv);

      const visibility = conv.members;
      const notif = {
        visibility: visibility,
        conv: body.conv._id,
        maker: body.chef._id,
        reciever: body.user._id,
        typeMsg: 'notif',
        sous_type: 'downgradeAdmin',
        recievedBy: [],
      };
      //creating notif
      await this.messageService.createNotif(notif);
      return conv;
    }
  }
}
