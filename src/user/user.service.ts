/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
    private webSocketService: WebSocketsService,
  ) {
    //set all users offline
    this.UserModel.updateMany({}, { status: 'offline' }).exec();
  }
  async userAlreadyExist(email: string) {
    email = email.toLowerCase();

    const user = await this.UserModel.findOne({ email: email }).exec();
    if (user === null) {
      return false;
    } else {
      return true;
    }
  }

  async create(createUserDto: CreateUserDto) {
    //set theme
    createUserDto.theme = 'basic';
    createUserDto.email = createUserDto.email.toLowerCase();
    createUserDto.photo = ' ';
    createUserDto.password2 = createUserDto.password2.trim();
    createUserDto.password = createUserDto.password.trim();
    if (createUserDto.password.length < 6) {
      return {
        status: 404,
        message: 'Short password !',
      };
    } else if (!createUserDto.email.includes('@')) {
      return {
        status: 404,
        message: 'Please,use your real email !',
      };
    }
    if (createUserDto.password != createUserDto.password2) {
      return { status: 404, message: 'Passwords dont match' };
    }
    if (await this.userAlreadyExist(createUserDto.email)) {
      return { status: 501, message: 'User already exist' };
    }
    createUserDto.status = 'offline';
    createUserDto.lastConnection = new Date();
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.photo = process.env.api_url + '/user/uploads/user.png';
    const userCreated = await this.UserModel.create(createUserDto);
    const user = await this.findConfidentialUser(userCreated._id);
    return {
      status: 200,
      message: 'Success, you can login now !',
      user: user,
    };
  }
  async addOptionsToUser(user: any, myid: string) {
    const fr = await this.areFriends(myid, user._id);
    const iSend = await this.alreadySend(myid, user._id);
    const heSend = await this.alreadySend(user._id, myid);

    if (fr) {
      user.operation = 'remove';
    } else if (iSend) {
      user.operation = 'cancel';
    } else if (heSend) {
      user.operation = 'accept';
    } else if (!fr) {
      user.operation = 'add';
    }

    return user;
  }
  async addOptionsToUsers(users: any[], myid: string) {
    users = await Promise.all(
      users.map(async (user) => {
        const fr = await this.areFriends(myid, user._id);
        const iSend = await this.alreadySend(myid, user._id);
        const heSend = await this.alreadySend(user._id, myid);

        if (fr) {
          user.operation = 'remove';
          return user;
        } else if (iSend) {
          user.operation = 'cancel';
          return user;
        } else if (heSend) {
          user.operation = 'accept';
          return user;
        } else if (!fr) {
          user.operation = 'add';
          return user;
        }
      }),
    );
    //remove me from users

    users = users.filter((user) => {
      return user._id.toString() != myid;
    });

    return users;
  }
  findAll() {
    return this.UserModel.find({}, { password: 0 }).exec();
  }
  async searched(key: string, myid: string) {
    let users: any = await this.UserModel.find(
      {
        $and: [
          { _id: { $ne: myid } },
          {
            $or: [
              { firstName: { $regex: key, $options: 'i' } },
              { lastName: { $regex: key, $options: 'i' } },
            ],
          },
        ],
      },
      { password: 0, email: 0 },
    ).exec();

    users = await this.addOptionsToUsers(users, myid);

    return users;
  }
  async findUserOfConv(tabOfIds: { user: string }[]) {
    const tabString: string[] = [];
    tabOfIds.map((object) => {
      tabString.push(object.user);
    });

    return this.UserModel.find({ _id: { $in: tabString } }).exec();
  }

  async findOne(id: string) {
    if (id == 'undefined') {
      return null;
    }

    const user = await this.UserModel.findOne({ _id: id }).exec();
    if (user === null) {
      return null;
    }
    user.password = null;
    user.email = null;
    user.codePassword = null;

    return user;
  }

  async getUserByEmail(email: string) {
    email = email.toLowerCase();

    return await this.UserModel.findOne({ email: email }).exec();
  }

  async login(data: any): Promise<any> {
    try {
      data.password = data.password.trim();
      const userExist = await this.userAlreadyExist(data.email);
      if (!userExist) {
        return { status: 501, message: 'Please verify your email !' };
      } else {
        const user = await this.getUserByEmail(data.email);
        const matchPassword = await bcrypt.compare(
          data.password,
          user.password,
        );
        if (matchPassword) {
          delete user.password;
          user.password = '';
          //set as online
          // setTimeout(
          //   async () => {
          //     const lastConnection: any = user.lastConnection;
          //     const now: any = new Date();
          //     const diff = now - lastConnection;
          //     if (diff > 1000 * 60 * 5) {
          //       await this.update(user._id, { status: 'offline' });
          //     }
          //   },
          //   1000 * 60 * 5 + 1000,
          // );
          await this.update(user._id, { lastConnection: new Date() });
          //set websocket subscription to notify friends

          const confidentielUser: any = await this.UserModel.findOne(
            { _id: user._id },
            {
              password: 0,
              codePassword: 0,
            },
          );
          if (confidentielUser == null) return;
          this.webSocketService.login(confidentielUser);
          //fill friends
          confidentielUser.friends = await Promise.all(
            confidentielUser.friends.map(async (friend: any) => {
              friend = await this.findConfidentialUser(friend);
              friend = await this.addOptionsToUser(
                friend,
                confidentielUser._id,
              );
              return friend;
            }),
          );
          return {
            status: 200,
            message: 'Success, you can login !',
            user: confidentielUser,
          };
        } else {
          return { status: 500, message: 'Password incorrect' };
        }
      }
    } catch (error) {
      console.log(error);

      return { status: 501, message: 'Please close the app and retry !' };
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (id == 'undefined') {
      return null;
    }
    if (
      updateUserDto.password !== undefined &&
      updateUserDto.password !== null
    ) {
      if (updateUserDto.password === updateUserDto.password2) {
        updateUserDto.password = updateUserDto.password.trim();
        updateUserDto.password2 = updateUserDto.password2.trim();
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();
        //notify other of changes
        const userFinal = await this.findConfidentialUser(id);
        this.webSocketService.someUserUpdated(userFinal);
        return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
      } else {
        return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
      }
    } else {
      await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();

      const user = await this.UserModel.findOne(
        { _id: id },
        { password: 0, codePassword: 0 },
      ).exec();
      //notify other of changes
      const userFinal = await this.findConfidentialUser(id);
      this.webSocketService.someUserUpdated(userFinal);
      return user;
    }
  }

  async resetPassword(updateUserDto: UpdateUserDto) {
    updateUserDto.email = updateUserDto.email.toLowerCase();
    updateUserDto.password = updateUserDto.password.trim();
    updateUserDto.password2 = updateUserDto.password2.trim();
    if (updateUserDto.codePassword.toString().length != 6) {
      return {
        status: 404,
        message: 'Password code must have 6 digits !',
      };
    } else if (updateUserDto.password != updateUserDto.password2) {
      return {
        status: 404,
        message: 'Passwords dont match !',
      };
    } else if (updateUserDto.password.length < 6) {
      return {
        status: 404,
        message: 'Short password !',
      };
    }
    const user = await this.getUserByEmail(updateUserDto.email);
    if (!user) {
      return {
        status: 404,
        message: 'Error with your email, restart !',
      };
    }
    this.UserModel.updateOne(
      { _id: user._id },
      {
        password: (await bcrypt.hash(updateUserDto.password, 10)).trim(),
        codePassword: '',
      },
    ).exec();
    return { status: 200, message: 'Success, you can login now !' };
  }
  async uploadProfilePhoto(file: any, id: string) {
    if (id == 'undefined') {
      return null;
    }
    const user = await this.UserModel.findOne({ _id: id }).exec();
    let oldPhoto = user.photo;
    const nameOldPhotoSplit = oldPhoto.split('/');
    oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
    if (oldPhoto !== process.env.defaultUserPhoto) {
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
    const photoName = process.env.api_url + '/user/uploads/' + file.filename;
    await this.UserModel.updateOne({ _id: id }, { photo: photoName });
    //notify other of changes

    const userFinal = await this.findConfidentialUser(id);
    this.webSocketService.someUserUpdated(userFinal);
    return { photo: photoName };
  }
  async remove(id: string): Promise<any> {
    const user = await this.UserModel.findOne({ _id: id }).exec();
    if (user == null) return;
    let oldPhoto = user.photo;
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
    return await this.UserModel.deleteMany({ _id: id }).exec();
  }
  deleteAll(): any {
    return this.UserModel.deleteMany().exec();
  }
  //FIXME why does status alternate in private conv on change
  //friendShip methods
  async addReq(addReq: any) {
    //push add req to reciever
    const date = new Date();
    await this.pushAddReq(addReq.sender, addReq.reciever);
    //prepare web socket subscription body
    const sender = await this.findConfidentialUser(addReq.sender);
    sender.operation = 'accept';
    const reciever = await this.findConfidentialUser(addReq.reciever);
    reciever.operation = 'cancel';
    //set websocket subscription to notify reciever
    this.webSocketService.addFriend({
      sender: sender,
      reciever: reciever,
      date: date,
      type: 'addReq',
    });
    return sender;
  }
  async findConfidentialUser(id: string) {
    if (id == 'undefined') {
      return null;
    }
    try {
      return this.UserModel.findOne(
        { _id: id },
        {
          password: 0,
          email: 0,
          codePassword: 0,
          addReqs: 0,
          friends: 0,
          accepters: 0,
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
  async removeFriend(myId: string, FriendId: string) {
    //set web socket subscription to notify concerned ppl
    this.webSocketService.onRemoveFriend({ remover: myId, removed: FriendId });
    await this.UserModel.updateOne(
      { _id: FriendId },
      { $pull: { friends: myId } },
    );
    return this.UserModel.updateOne(
      { _id: myId },
      { $pull: { friends: FriendId } },
    );
  }
  refuseFriend(refuser: string, refused: string) {
    this.webSocketService.cancelFriend({
      canceler: refuser,
      canceled: refused,
    });
    return this.pullAddReq(refused, refuser);
  }
  async pullAddReq(sender: string, recieverId: string) {
    const reciever = await this.UserModel.findOne({ _id: recieverId }).exec();
    let addreqs = reciever.addReqs;
    addreqs = addreqs.filter((addreq: any) => {
      return addreq.id != sender;
    });

    return this.UserModel.updateOne({ _id: recieverId }, { addReqs: addreqs });
  }
  async pushAddReq(sender: string, recieverId: string) {
    const date = new Date();
    const reciever = await this.UserModel.findOne({ _id: recieverId }).exec();
    const addreqs = reciever.addReqs;
    addreqs.map((addreq: any) => {
      if (addreq.id == sender) {
        return null;
      }
    });
    addreqs.push({ id: sender, date: date });
    return this.UserModel.updateOne({ _id: recieverId }, { addReqs: addreqs });
  }
  async cancel(canceler: string, canceled: string) {
    this.webSocketService.cancelFriend({
      canceler: canceler,
      canceled: canceled,
    });
    //pull addreq
    return await this.pullAddReq(canceler, canceled);
  }
  async accept(myId: string, FriendId: string) {
    const date = new Date();
    //add to friends of both
    const firstAdd = await this.UserModel.updateOne(
      { _id: myId },
      { $addToSet: { friends: FriendId } },
    );
    //pull addreq
    await this.pullAddReq(FriendId, myId);
    const secAdd = await this.UserModel.updateOne(
      { _id: FriendId },
      {
        $addToSet: { friends: myId, accepters: { id: myId, date: date } },
      },
    );
    //set web socket subscription to notify reciever
    const accepter = await this.findConfidentialUser(myId);
    accepter.operation = 'remove';
    const accepted = await this.findConfidentialUser(FriendId);
    accepted.operation = 'remove';

    this.webSocketService.acceptFriend({
      accepter: accepter,
      accepted: accepted,
      date: date,
      type: 'acceptation',
    });
    return { firstAdd, secAdd };
  }
  async areFriends(myId: string, FriendId: string) {
    myId = myId.toString();
    FriendId = FriendId.toString();

    const res = await this.UserModel.findOne({
      _id: myId,
      friends: { $in: [FriendId] },
    }).exec();

    if (res === null) {
      return false;
    } else {
      return true;
    }
  }

  async alreadySend(sender: string, recieverId: string) {
    sender = sender.toString();
    recieverId = recieverId.toString();

    const reciever = await this.UserModel.findOne({
      _id: recieverId,
    }).exec();
    const addreqs = reciever.addReqs;

    for (let i = 0; i < addreqs.length; i++) {
      const addreq = addreqs[i];
      if (addreq.id == sender) {
        return true;
      }
    }
    return false;
  }
  async getMyFriends(id: string) {
    const me: any = await this.UserModel.findById(id).exec();
    const myFriends = me.friends;
    let users: any = await this.UserModel.find({
      _id: { $in: myFriends },
    }).exec();
    users = await this.addOptionsToUsers(users, id);
    return users;
  }
  async getNotifs(id: string) {
    const res: any[] = [];
    const me = await this.UserModel.findById(id).exec();
    if (me == null) return res;
    const myAddReqs = me.addReqs;
    const accepters = me.accepters;
    if (myAddReqs.length == 0 && accepters.length == 0) {
      return res;
    }
    await Promise.all(
      myAddReqs.map(async (addreq) => {
        const user = await this.findConfidentialUser(addreq.id);
        user.operation = 'accept';
        res.push({ user: user, date: addreq.date, type: 'addReq' });
      }),
    );
    await Promise.all(
      accepters.map(async (accepter) => {
        const user = await this.findConfidentialUser(accepter.id);
        user.operation = 'remove';
        res.push({ user: user, date: accepter.date, type: 'acceptation' });
      }),
    );
    res.sort((a, b) => {
      return b.date - a.date;
    });
    return res;
  }
  async friendsToAdd(idUser: string, members: string[]) {
    let friends = await this.UserModel.find(
      { friends: { $in: [idUser] } },
      { password: 0, email: 0, codePassword: 0, addReqs: 0, friends: 0 },
    ).exec();
    //keep only friends that are not members of the conv
    friends = friends.filter((friend) => {
      return !members.includes(friend._id.toString());
    });

    return friends;
  }
  resetAccepters(id: string) {
    return this.UserModel.updateOne({ _id: id }, { accepters: [] }).exec();
  }
}
