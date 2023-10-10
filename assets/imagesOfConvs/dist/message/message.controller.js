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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
let MessageController = class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
    }
    create(createMessageDto) {
        return this.messageService.create(createMessageDto);
    }
    findAll() {
        return this.messageService.findAll();
    }
    findOne(id) {
        return this.messageService.findOne(id);
    }
    getRange(idConv, idMessage) {
        return this.messageService.getRange(idConv, idMessage);
    }
    getMessageSearchedGroup(idConv, idMessage, userId) {
        return this.messageService.getMessageSearchedGroup(idConv, idMessage, userId);
    }
    appendDown(idConv, idMessage, userId) {
        return this.messageService.appendDown(idConv, idMessage, userId);
    }
    appendUp(idConv, idMessage, userId) {
        return this.messageService.appendUp(idConv, idMessage, userId);
    }
    getMessagesByKey(key, idConv, idUser) {
        return this.messageService.getMessagesByKey(key, idConv, idUser);
    }
    findMessageOfConv(idConv, idUser) {
        return this.messageService.findMessageOfConv(idConv, idUser);
    }
    update(id, updateMessageDto) {
        return this.messageService.update(id, updateMessageDto);
    }
    setVus(body) {
        return this.messageService.setVus(body);
    }
    remove(id) {
        return this.messageService.remove(id);
    }
    deleteForMe(object) {
        return this.messageService.deleteForMe(object);
    }
    removeAll() {
        return this.messageService.removeAll();
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('range/:idConv/:idMessage'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('idMessage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "getRange", null);
__decorate([
    (0, common_1.Get)('MessageSearchedGroup/:idConv/:idMessage/:userId'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('idMessage')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "getMessageSearchedGroup", null);
__decorate([
    (0, common_1.Get)('appendDown/:idConv/:idMessage/:userId'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('idMessage')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "appendDown", null);
__decorate([
    (0, common_1.Get)('appendUp/:idConv/:idMessage/:userId'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('idMessage')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "appendUp", null);
__decorate([
    (0, common_1.Get)('search/:key/:idConv/:idUser'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Param)('idConv')),
    __param(2, (0, common_1.Param)('idUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "getMessagesByKey", null);
__decorate([
    (0, common_1.Get)('/ofConv/:idConv/:idUser'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('idUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "findMessageOfConv", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_message_dto_1.UpdateMessageDto]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('/set/vus'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "setVus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('delete/ForMe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "deleteForMe", null);
__decorate([
    (0, common_1.Delete)('/all/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "removeAll", null);
exports.MessageController = MessageController = __decorate([
    (0, common_1.Controller)('message'),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
//# sourceMappingURL=message.controller.js.map