import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { env } from 'src/env';
// import * as path from 'path';
// import { env } from 'src/env';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<UserDocument>,
  ) {}
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
    createUserDto.email = createUserDto.email.toLowerCase();
    createUserDto.photo = ' ';
    createUserDto.password2 = createUserDto.password2.trim();
    createUserDto.password = createUserDto.password.trim();

    if (createUserDto.password === createUserDto.password2) {
      if (await this.userAlreadyExist(createUserDto.email)) {
        return { status: 501, message: 'User already exist' };
      }
      createUserDto.status = 'online';
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.photo = env.api_url + '/user/uploads/user.png';
      const user = await this.UserModel.create(createUserDto);
      delete user.password;
      user.password = '';
      return {
        status: 200,
        message: 'Success, you can login now !',
        user: user,
      };
    } else {
      return { status: 500, message: 'Passwords dont match' };
    }
  }
  async addOptionsToUsers(users: any[], myid: string) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const fr = await new Promise((resolve) => {
        resolve(this.areFriends(myid, user._id));
      });
      const iSend = await new Promise((resolve) => {
        resolve(this.alreadySend(myid, user._id));
      });
      const heSend = await new Promise((resolve) => {
        resolve(this.alreadySend(user._id, myid));
      });

      if (fr) {
        user.operation = 'remove';
      } else if (iSend) {
        user.operation = 'cancel';
      } else if (heSend) {
        user.operation = 'accept';
      } else if (!fr) {
        user.operation = 'add';
      }
      if (user._id.toString() === myid) {
        users.splice(i, 1);
        continue;
      }
    }
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
    for (const object of tabOfIds) {
      tabString.push(object.user);
    }

    return this.UserModel.find({ _id: { $in: tabString } }).exec();
  }

  async findOne(id: string) {
    const user = await this.UserModel.findOne({ _id: id }).exec();
    if (user === null) {
      return null;
    }
    user.password = null;
    user.email = null;
    user.codePassword = null;

    return user;
  }
  async findeUserForMessage(id: string) {
    const res = await this.UserModel.findById(
      id,
      {
        firstName: 1,
        lastName: 1,
        photo: 1,
      },
      { password: 0, email: 0 },
    ).exec();

    return res;
  }
  async getUserByEmail(email: string) {
    email = email.toLowerCase();
    return await this.UserModel.findOne({ email: email }).exec();
  }

  async login(data: any): Promise<any> {
    data.password = data.password.trim();
    const userExist = await this.userAlreadyExist(data.email);
    if (!userExist) {
      return { status: 501, message: 'Please verify your email !' };
    } else {
      const user = await this.getUserByEmail(data.email);
      const matchPassword = await bcrypt.compare(data.password, user.password);
      if (matchPassword) {
        delete user.password;
        user.password = '';
        return { status: 200, message: 'Success, you can login !', user: user };
      } else {
        return { status: 500, message: 'Password incorrect' };
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (
      updateUserDto.password !== undefined &&
      updateUserDto.password !== null
    ) {
      if (updateUserDto.password === updateUserDto.password2) {
        updateUserDto.password = updateUserDto.password.trim();
        updateUserDto.password2 = updateUserDto.password2.trim();

        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();
        return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
      } else {
        return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
      }
    } else {
      // const updateing =
      await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();

      const user = await this.UserModel.findOne(
        { _id: id },
        { password: 0 },
      ).exec();

      return user;
    }
  }
  async resetPassword(updateUserDto: UpdateUserDto) {
    updateUserDto.email = updateUserDto.email.toLowerCase();
    updateUserDto.password = updateUserDto.password.trim();
    const user = await this.getUserByEmail(updateUserDto.email);

    if (updateUserDto.codePassword == user.codePassword) {
      if (
        updateUserDto.password == updateUserDto.password2 &&
        updateUserDto.password != ''
      ) {
        this.UserModel.updateOne(
          { _id: user._id },
          {
            password: (await bcrypt.hash(updateUserDto.password, 10)).trim(),
            codePassword: '',
          },
        ).exec();
        return { status: 200, message: 'Success, you can login now !' };
      } else {
        return { status: 404, message: 'Passwords dont match' };
      }
    } else {
      return { status: 404, message: 'Code incorrect' };
    }
  }
  async uploadProfilePhoto(file: any, id: string) {
    const user = await this.UserModel.findOne({ _id: id }).exec();
    let oldPhoto = user.photo;
    const nameOldPhotoSplit = oldPhoto.split('/');
    oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
    console.log(oldPhoto);

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
    const photoName = env.api_url + '/user/uploads/' + file.filename;
    await this.UserModel.updateOne({ _id: id }, { photo: photoName });
    return { photo: photoName };
  }
  async remove(id: string): Promise<any> {
    const user = await this.UserModel.findOne({ _id: id }).exec();
    let oldPhoto = user.photo;
    const nameOldPhotoSplit = oldPhoto.split('/');
    oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
    console.log(oldPhoto);

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

  //friendShip methods
  addReq(addReq: any) {
    return this.UserModel.updateOne(
      { _id: addReq.reciever },
      {
        $addToSet: { addReqs: addReq.sender },
      },
    );
  }
  async removeFriend(myId: string, FriendId: string) {
    await this.UserModel.updateOne(
      { _id: FriendId },
      { $pull: { friends: myId } },
    );
    return this.UserModel.updateOne(
      { _id: myId },
      { $pull: { friends: FriendId } },
    );
  }
  refuseFriend(refuser: string, refued: string) {
    return this.UserModel.updateOne(
      { _id: refuser },
      { $pull: { addReqs: refued } },
    );
  }
  cancel(canceler: string, canceled: string) {
    return this.UserModel.updateOne(
      { _id: canceled },
      { $pull: { addReqs: canceler } },
    );
  }
  async accept(myId: string, FriendId: string) {
    //remove from addReqs and add to friends
    await this.UserModel.updateOne(
      { _id: myId },
      { $pull: { addReqs: FriendId } },
    ).exec();
    //add to friends of both
    const firstAdd = await this.UserModel.updateOne(
      { _id: myId },
      { $addToSet: { friends: FriendId } },
    );
    const secAdd = await this.UserModel.updateOne(
      { _id: FriendId },
      { $addToSet: { friends: myId } },
    );

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

  async alreadySend(sender: string, reciever: string) {
    sender = sender.toString();
    reciever = reciever.toString();
    const res = await this.UserModel.findOne({
      _id: reciever,
      addReqs: { $in: [sender] },
    }).exec();
    if (res === null) {
      return false;
    } else {
      return true;
    }
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
  async findreqSentToMe(id: string) {
    let res: any[] = [];
    const me = await this.UserModel.findById(id).exec();
    const myAddReqs = me.addReqs;
    for (let index = 0; index < myAddReqs.length; index++) {
      const element = myAddReqs[index];
      const user = await this.UserModel.findById(element).exec();
      res.push(user);
    }
    res = await this.addOptionsToUsers(res, id);
    return res;
  }
}
