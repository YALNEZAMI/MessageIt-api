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
exports.ConvService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conv_entity_1 = require("./entities/conv.entity");
const user_service_1 = require("../user/user.service");
const message_service_1 = require("../message/message.service");
const fs = require("fs");
const session_service_1 = require("../session/session.service");
let ConvService = class ConvService {
    constructor(ConvModel, userService, messageService, sessionService) {
        this.ConvModel = ConvModel;
        this.userService = userService;
        this.messageService = messageService;
        this.sessionService = sessionService;
    }
    async convExistBetween(id1, id2) {
        const allConvs = await this.ConvModel.find().exec();
        for (let i = 0; i < allConvs.length; i++) {
            const conv = allConvs[i];
            const members = conv.members;
            if (members.includes(id1) && members.includes(id2)) {
                return { bool: true, idConv: conv._id };
            }
        }
        return { bool: false, idConv: null };
    }
    async convOfUser(idUser) {
        const myConvs = await this.ConvModel.find({
            members: { $in: [idUser] },
        }).exec();
        return myConvs;
    }
    async create(createConvDto) {
        const exist = await this.convExistBetween(createConvDto.members[0], createConvDto.members[1]);
        if (exist.bool) {
            return await this.findOne(exist.idConv);
        }
        else {
            createConvDto.photo = process.env.api_url + '/user/uploads/user.png';
            createConvDto.status = 'online';
            const convCreated = await this.ConvModel.create(createConvDto);
            const newId = convCreated._id.toString();
            const finalConv = await this.findOne(newId);
            return finalConv;
        }
    }
    async addOptionsToUsers(users, myid) {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user == null) {
                continue;
            }
            const fr = await this.userService.areFriends(myid, user._id);
            const iSend = await this.userService.alreadySend(myid, user._id);
            const heSend = await this.userService.alreadySend(user._id, myid);
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
        }
        return users;
    }
    async getMembers(idConv, myId) {
        let res = [];
        const conv = await this.findOne(idConv);
        const UserIds = conv.members;
        for (let i = 0; i < UserIds.length; i++) {
            const element = UserIds[i];
            const user = await this.userService.findOne(element);
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
    async getLastMessage(idConv) {
        const messages = await this.messageService.findAllMessageOfConv(idConv);
        if (messages.length == 0) {
            return null;
        }
        else {
            return messages[messages.length - 1];
        }
    }
    async getMyConvs(id) {
        await this.sessionService.setStatus(id, { status: 'online' });
        const myConvs = await this.convOfUser(id);
        if (myConvs.length == 0) {
            return [];
        }
        for (let i = 0; i < myConvs.length; i++) {
            const conv = myConvs[i];
            const membersId = conv.members;
            const members = [];
            for (const memberId of membersId) {
                const user = await this.userService.findOne(memberId);
                if (user == null) {
                    continue;
                }
                else {
                    members.push(user);
                }
            }
            conv.members = members;
            const lasMessage = await this.getLastMessage(conv._id.toString());
            conv.lastMessage = lasMessage;
            if (members.length > 2) {
                conv.name = 'Group chat';
            }
            else if (members.length == 1) {
                const me = await this.userService.findOne(id);
                conv.name = me.firstName + ' ' + me.lastName;
            }
            else {
                if ((members.length = 2)) {
                    if (members[0]._id == id) {
                        const friend = await this.userService.findOne(members[1]);
                        if (friend != null) {
                            conv.name = friend.firstName + ' ' + friend.lastName;
                        }
                        else {
                            const me = await this.userService.findOne(id);
                            conv.name = me.firstName + ' ' + me.lastName;
                        }
                    }
                    else {
                        const friend = await this.userService.findOne(members[0]);
                        if (friend != null) {
                            conv.name = friend.firstName + ' ' + friend.lastName;
                        }
                        else {
                            const me = await this.userService.findOne(id);
                            conv.name = me.firstName + ' ' + me.lastName;
                        }
                    }
                }
            }
            if (members.length == 1) {
                const me = await this.userService.findOne(id);
                conv.photo = me.photo;
            }
            if (members.length > 2) {
                if (conv.photo == undefined ||
                    conv.photo == null ||
                    conv.photo == ' ' ||
                    conv.photo == '') {
                    conv.photo = process.env.api_url + '/user/uploads/group.png';
                }
            }
            if (members.length == 2) {
                if (members[0]._id == id) {
                    const friend = await this.userService.findOne(members[1]);
                    if (friend == null || friend.photo == undefined) {
                        conv.photo = ' ';
                    }
                    else {
                        conv.photo = friend.photo;
                    }
                }
                else {
                    const friend = await this.userService.findOne(members[0]);
                    if (friend == null || friend.photo == undefined) {
                        conv.photo = ' ';
                    }
                    else {
                        conv.photo = friend.photo;
                    }
                }
            }
        }
        return myConvs;
    }
    findAll() {
        return this.ConvModel.find().exec();
    }
    async searched(key, myid) {
        const res = new Set();
        const convs = await this.getMyConvs(myid);
        for (let i = 0; i < convs.length; i++) {
            const conv = convs[i];
            const nameConv = conv.name.toLowerCase();
            if (nameConv.includes(key.toLowerCase())) {
                res.add(conv);
            }
            const members = conv.members;
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
    async findOne(id) {
        const conv = await this.ConvModel.findOne({ _id: id }).exec();
        const members = conv.members;
        if (conv.name == undefined) {
            if (members.length > 2) {
                conv.name = 'Group chat';
            }
            else if (members.length == 1) {
                conv.name = 'Saved messages';
            }
            else {
                if (members[0] == id) {
                    const friend = await this.userService.findOne(members[1]);
                    if (friend == null) {
                        const friend = await this.userService.findOne(members[0]);
                        conv.name = friend.firstName + ' ' + friend.lastName;
                    }
                    conv.name = friend.firstName + ' ' + friend.lastName;
                }
                else {
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
    async update(id, updateConvDto) {
        await this.ConvModel.updateOne({ _id: id }, updateConvDto).exec();
        const conv = await this.findOne(id);
        return conv;
    }
    async updatePhoto(id, photo) {
        const conv = await this.findOne(id);
        let oldPhoto = conv.photo;
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
        const photoName = process.env.api_url + '/user/uploads/' + photo.filename;
        await this.ConvModel.updateOne({ _id: id }, { photo: photoName });
        return { photo: photoName };
    }
    async remove(id) {
        const conv = await this.findOne(id);
        let oldPhoto = conv.photo;
        const nameOldPhotoSplit = oldPhoto.split('/');
        oldPhoto = nameOldPhotoSplit[nameOldPhotoSplit.length - 1];
        if (oldPhoto != process.env.defaultUserPhoto &&
            oldPhoto != process.env.defaultGroupPhoto) {
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
        await this.messageService.removeAllFromConv(id);
        return this.ConvModel.deleteMany({ _id: id }).exec();
    }
    removeAll() {
        return this.ConvModel.deleteMany().exec();
    }
    async leaveConv(id, idConv) {
        const conv = await this.findOne(idConv);
        const members = conv.members;
        members.splice(members.indexOf(id), 1);
        if (members.length == 0) {
            return this.remove(idConv);
        }
        else {
            return await this.update(conv._id, { members: members });
        }
    }
    async leaveAllConv(id) {
        const convs = await this.convOfUser(id);
        for (let i = 0; i < convs.length; i++) {
            this.leaveConv(id, convs[i]._id);
        }
    }
};
exports.ConvService = ConvService;
exports.ConvService = ConvService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conv_entity_1.Conv.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        message_service_1.MessageService,
        session_service_1.SessionService])
], ConvService);
//# sourceMappingURL=conv.service.js.map