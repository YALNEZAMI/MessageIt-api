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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const message_entity_1 = require("./entities/message.entity");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const user_service_1 = require("../user/user.service");
const web_sockets_service_1 = require("../web-sockets/web-sockets.service");
const session_service_1 = require("../session/session.service");
const fs = require("fs");
let MessageService = class MessageService {
    constructor(messageModel, userService, sessionService, webSocketService) {
        this.messageModel = messageModel;
        this.userService = userService;
        this.sessionService = sessionService;
        this.webSocketService = webSocketService;
    }
    async create(object, files) {
        const createMessageDto = JSON.parse(object.message);
        createMessageDto.visibility = [];
        for (let i = 0; i < createMessageDto.conv.members.length; i++) {
            const member = createMessageDto.conv.members[i];
            createMessageDto.visibility.push(member._id);
        }
        createMessageDto.conv = createMessageDto.conv._id;
        createMessageDto.vus = [];
        createMessageDto.vus.push(createMessageDto.sender);
        await this.sessionService.setStatus(createMessageDto.sender);
        const filesNames = [];
        for (const file of files) {
            filesNames.push(process.env.api_url + '/message/uploads/' + file.filename);
        }
        createMessageDto.files = filesNames;
        const msg = await this.messageModel.create(createMessageDto);
        msg.sender = await this.userService.findeUserForMessage(msg.sender);
        this.webSocketService.onNewMessage(msg);
        return msg;
    }
    findAll() {
        return this.messageModel.find().exec();
    }
    async findAllMessageOfConv(idConv) {
        const msgs = await this.messageModel.find({ conv: idConv }).exec();
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            const user = await this.userService.findeUserForMessage(msg.sender);
            msg.sender = user;
        }
        return msgs;
    }
    async getMessageSearchedGroup(idConv, idMessage, userId) {
        let range = await this.getRange(idConv, idMessage, userId);
        let messages = [];
        const totalCount = await this.messageModel.countDocuments({
            conv: idConv,
            visibility: { $in: [userId] },
        });
        let limit = 20;
        if (totalCount < 20) {
            messages = await this.messageModel
                .find({ conv: idConv, visibility: { $in: [userId] } })
                .exec();
        }
        else {
            if (range < 20) {
                range = 0;
            }
            else if (totalCount - range < 20) {
                limit = totalCount - range;
            }
            else {
                range -= 10;
                limit = 20;
            }
            messages = await this.messageModel
                .find({ conv: idConv })
                .skip(range)
                .limit(limit)
                .exec();
        }
        messages = await this.fillSenderAndRef(messages);
        return messages;
    }
    async findMessageOfConv(idConv, idUser) {
        const total = await this.messageModel.countDocuments({
            conv: idConv,
            visibility: { $in: [idUser] },
        });
        const limit = 20;
        const skip = total - limit;
        let messages = [];
        if (total < 20) {
            messages = await this.messageModel
                .find({ conv: idConv, visibility: { $in: [idUser] } })
                .exec();
        }
        else {
            messages = await this.messageModel
                .find({ conv: idConv, visibility: { $in: [idUser] } })
                .skip(skip)
                .limit(limit)
                .exec();
        }
        messages = await this.fillSenderAndRef(messages);
        return messages;
    }
    getMedias(idConv, idUser) {
        return this.messageModel
            .find({
            conv: idConv,
            visibility: { $in: [idUser] },
            files: { $exists: true, $ne: [] },
        })
            .exec();
    }
    async fillSenderAndRef(messages) {
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const user = await this.userService.findeUserForMessage(msg.sender);
            msg.sender = user;
            if (msg.ref != '') {
                const repMsg = await this.messageModel.findById(msg.ref);
                msg.ref = repMsg;
                const senderRef = await this.userService.findeUserForMessage(msg.ref.sender);
                msg.ref.sender = senderRef;
            }
        }
        return messages;
    }
    async getRange(idConv, idMessage, userId) {
        const all = await this.messageModel
            .find({ conv: idConv, visibility: { $in: [userId] } })
            .exec();
        const index = all.findIndex((msg) => msg._id == idMessage);
        return index;
    }
    async getMessagesByKey(key, idConv, idUser) {
        let messages = await this.messageModel
            .find({
            conv: idConv,
            visibility: { $in: [idUser] },
            text: { $regex: key, $options: 'i' },
        })
            .exec();
        messages = await this.fillSenderAndRef(messages);
        return messages;
    }
    findOne(id) {
        return this.findOne(id).exec();
    }
    async appendDown(idConv, idMessage, userId) {
        let range = await this.getRange(idConv, idMessage, userId);
        let limit = 20;
        const totalCount = await this.messageModel.countDocuments({
            conv: idConv,
            visibility: { $in: [userId] },
        });
        if (totalCount - range < 20) {
            range++;
            limit = totalCount - range;
        }
        let messages = await this.messageModel
            .find({ conv: idConv, visibility: { $in: [userId] } })
            .skip(range)
            .limit(limit)
            .exec();
        messages = await this.fillSenderAndRef(messages);
        return messages;
    }
    async appendUp(idConv, idMessage, userId) {
        let range = await this.getRange(idConv, idMessage, userId);
        if (range == 0)
            return [];
        let limit = 20;
        if (range < 20) {
            limit = range;
            range = 0;
        }
        let messages = await this.messageModel
            .find({ conv: idConv, visibility: { $in: [userId] } })
            .skip(range)
            .limit(limit)
            .exec();
        messages = await this.fillSenderAndRef(messages);
        return messages;
    }
    update(id, updateMessageDto) {
        return this.messageModel.updateOne({ _id: id }, updateMessageDto).exec();
    }
    async setVus(body) {
        this.webSocketService.onSetVus(body);
        const id = body.myId;
        this.sessionService.setStatus(id);
        const idConv = body.idConv;
        this.messageModel
            .updateMany({ conv: idConv }, { $addToSet: { vus: id } })
            .exec();
    }
    async remove(id) {
        const msg = await this.messageModel.findOne({ _id: id }).exec();
        const files = msg.files;
        for (let file of files) {
            file = file.split('/');
            file = file[file.length - 1];
            fs.access('assets/imagesOfMessages/' + file, fs.constants.F_OK, (err) => {
                if (err) {
                }
                else {
                    fs.unlink('assets/imagesOfMessages/' + file, (err) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                }
            });
        }
        await this.messageModel.deleteMany({ _id: id }).exec();
        const obj = {
            idMsg: msg._id,
            idUser: msg.sender,
            operation: 'deleteForAll',
        };
        this.webSocketService.onMessageDeleted(obj);
        return obj;
    }
    async deleteForMe(object) {
        object.operation = 'deleteForMe';
        this.webSocketService.onMessageDeleted(object);
        const msg = await this.messageModel.findOne({ _id: object.idMsg }).exec();
        if (msg.visibility.length == 1) {
            return await this.remove(object.idMsg);
        }
        return this.messageModel
            .updateOne({ _id: object.idMsg }, {
            $pull: { visibility: object.idUser },
        })
            .exec();
    }
    async removeAll() {
        const msgsWithMedias = await this.messageModel
            .find({ files: { $exists: true, $ne: [] } })
            .exec();
        for (const msg of msgsWithMedias) {
            const files = msg.files;
            for (let file of files) {
                file = file.split('/');
                file = file[file.length - 1];
                fs.access('assets/imagesOfMessages/' + file, fs.constants.F_OK, (err) => {
                    if (err) {
                    }
                    else {
                        fs.unlink('assets/imagesOfMessages/' + file, (err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    }
                });
            }
        }
        return this.messageModel.deleteMany().exec();
    }
    removeAllFromConv(idConv) {
        return this.messageModel.deleteMany({ conv: idConv }).exec();
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(message_entity_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_1.Model,
        user_service_1.UserService,
        session_service_1.SessionService,
        web_sockets_service_1.WebSocketsService])
], MessageService);
//# sourceMappingURL=message.service.js.map