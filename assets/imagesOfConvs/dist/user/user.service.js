"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("./entities/user.entity");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
let UserService = class UserService {
    constructor(UserModel) {
        this.UserModel = UserModel;
        this.UserModel.updateMany({}, { status: 'offline' }).exec();
    }
    async userAlreadyExist(email) {
        email = email.toLowerCase();
        const user = await this.UserModel.findOne({ email: email }).exec();
        if (user === null) {
            return false;
        }
        else {
            return true;
        }
    }
    async create(createUserDto) {
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
        }
        else if (!createUserDto.email.includes('@')) {
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
        const user = await this.UserModel.create(createUserDto);
        delete user.password;
        user.password = '';
        return {
            status: 200,
            message: 'Success, you can login now !',
            user: user,
        };
    }
    async addOptionsToUsers(users, myid) {
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
            }
            else if (iSend) {
                user.operation = 'cancel';
            }
            else if (heSend) {
                user.operation = 'accept';
            }
            else if (!fr) {
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
    async searched(key, myid) {
        let users = await this.UserModel.find({
            $and: [
                { _id: { $ne: myid } },
                {
                    $or: [
                        { firstName: { $regex: key, $options: 'i' } },
                        { lastName: { $regex: key, $options: 'i' } },
                    ],
                },
            ],
        }, { password: 0, email: 0 }).exec();
        users = await this.addOptionsToUsers(users, myid);
        return users;
    }
    async findUserOfConv(tabOfIds) {
        const tabString = [];
        for (const object of tabOfIds) {
            tabString.push(object.user);
        }
        return this.UserModel.find({ _id: { $in: tabString } }).exec();
    }
    async findOne(id) {
        const user = await this.UserModel.findOne({ _id: id }).exec();
        if (user === null) {
            return null;
        }
        user.password = null;
        user.email = null;
        user.codePassword = null;
        return user;
    }
    async findeUserForMessage(id) {
        const res = await this.UserModel.findById(id, {
            firstName: 1,
            lastName: 1,
            photo: 1,
        }, { password: 0, email: 0 }).exec();
        return res;
    }
    async getUserByEmail(email) {
        email = email.toLowerCase();
        return await this.UserModel.findOne({ email: email }).exec();
    }
    async login(data) {
        data.password = data.password.trim();
        const userExist = await this.userAlreadyExist(data.email);
        if (!userExist) {
            return { status: 501, message: 'Please verify your email !' };
        }
        else {
            const user = await this.getUserByEmail(data.email);
            const matchPassword = await bcrypt.compare(data.password, user.password);
            if (matchPassword) {
                delete user.password;
                user.password = '';
                setTimeout(async () => {
                    const lastConnection = user.lastConnection;
                    const now = new Date();
                    const diff = now - lastConnection;
                    if (diff > 300000) {
                        await this.update(user._id, { status: 'offline' });
                    }
                }, 305000);
                await this.update(user._id, { lastConnection: new Date() });
                return { status: 200, message: 'Success, you can login !', user: user };
            }
            else {
                return { status: 500, message: 'Password incorrect' };
            }
        }
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password !== undefined &&
            updateUserDto.password !== null) {
            if (updateUserDto.password === updateUserDto.password2) {
                updateUserDto.password = updateUserDto.password.trim();
                updateUserDto.password2 = updateUserDto.password2.trim();
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
                await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();
                return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
            }
            else {
                return this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
            }
        }
        else {
            await this.UserModel.updateOne({ _id: id }, updateUserDto).exec();
            const user = await this.UserModel.findOne({ _id: id }, { password: 0 }).exec();
            return user;
        }
    }
    async resetPassword(updateUserDto) {
        updateUserDto.email = updateUserDto.email.toLowerCase();
        updateUserDto.password = updateUserDto.password.trim();
        updateUserDto.password2 = updateUserDto.password2.trim();
        if (updateUserDto.codePassword.toString().length != 6) {
            return {
                status: 404,
                message: 'Password code must have 6 digits !',
            };
        }
        else if (updateUserDto.password != updateUserDto.password2) {
            return {
                status: 404,
                message: 'Passwords dont match !',
            };
        }
        else if (updateUserDto.password.length < 6) {
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
        this.UserModel.updateOne({ _id: user._id }, {
            password: (await bcrypt.hash(updateUserDto.password, 10)).trim(),
            codePassword: '',
        }).exec();
        return { status: 200, message: 'Success, you can login now !' };
    }
    async uploadProfilePhoto(file, id) {
        const user = await this.UserModel.findOne({ _id: id }).exec();
        let oldPhoto = user.photo;
        const nameOldPhotoSplit = oldPhoto.split('/');
        oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
        if (oldPhoto !== process.env.defaultUserPhoto) {
            fs.access('assets/imagesOfConvs/' + oldPhoto, fs.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    fs.unlink('assets/imagesOfConvs/' + oldPhoto, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                }
            });
        }
        const photoName = process.env.api_url + '/user/uploads/' + file.filename;
        await this.UserModel.updateOne({ _id: id }, { photo: photoName });
        return { photo: photoName };
    }
    async remove(id) {
        const user = await this.UserModel.findOne({ _id: id }).exec();
        let oldPhoto = user.photo;
        const nameOldPhotoSplit = oldPhoto.split('/');
        oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
        fs.access('assets/imagesOfConvs/' + oldPhoto, fs.constants.F_OK, (err) => {
            if (err) {
            }
            else {
                fs.unlink('assets/imagesOfConvs/' + oldPhoto, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
        });
        return await this.UserModel.deleteMany({ _id: id }).exec();
    }
    deleteAll() {
        return this.UserModel.deleteMany().exec();
    }
    addReq(addReq) {
        return this.UserModel.updateOne({ _id: addReq.reciever }, {
            $addToSet: { addReqs: addReq.sender },
        });
    }
    async removeFriend(myId, FriendId) {
        await this.UserModel.updateOne({ _id: FriendId }, { $pull: { friends: myId } });
        return this.UserModel.updateOne({ _id: myId }, { $pull: { friends: FriendId } });
    }
    refuseFriend(refuser, refued) {
        return this.UserModel.updateOne({ _id: refuser }, { $pull: { addReqs: refued } });
    }
    cancel(canceler, canceled) {
        return this.UserModel.updateOne({ _id: canceled }, { $pull: { addReqs: canceler } });
    }
    async accept(myId, FriendId) {
        await this.UserModel.updateOne({ _id: myId }, { $pull: { addReqs: FriendId } }).exec();
        const firstAdd = await this.UserModel.updateOne({ _id: myId }, { $addToSet: { friends: FriendId } });
        const secAdd = await this.UserModel.updateOne({ _id: FriendId }, { $addToSet: { friends: myId } });
        return { firstAdd, secAdd };
    }
    async areFriends(myId, FriendId) {
        myId = myId.toString();
        FriendId = FriendId.toString();
        const res = await this.UserModel.findOne({
            _id: myId,
            friends: { $in: [FriendId] },
        }).exec();
        if (res === null) {
            return false;
        }
        else {
            return true;
        }
    }
    async alreadySend(sender, reciever) {
        sender = sender.toString();
        reciever = reciever.toString();
        const res = await this.UserModel.findOne({
            _id: reciever,
            addReqs: { $in: [sender] },
        }).exec();
        if (res === null) {
            return false;
        }
        else {
            return true;
        }
    }
    async getMyFriends(id) {
        const me = await this.UserModel.findById(id).exec();
        const myFriends = me.friends;
        let users = await this.UserModel.find({
            _id: { $in: myFriends },
        }).exec();
        users = await this.addOptionsToUsers(users, id);
        return users;
    }
    async findreqSentToMe(id) {
        let res = [];
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map