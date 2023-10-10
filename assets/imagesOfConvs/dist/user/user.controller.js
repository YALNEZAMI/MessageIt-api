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
exports.UserController = void 0;
const fs = require("fs");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    login(req, email, password) {
        const data = {
            email: email,
            password: password,
        };
        return this.userService.login(data);
    }
    findAll() {
        return this.userService.findAll();
    }
    searched(key, myid) {
        return this.userService.searched(key, myid);
    }
    findOne(id) {
        return this.userService.findOne(id);
    }
    findreqSentToMe(id) {
        return this.userService.findreqSentToMe(id);
    }
    findUserOfConv(data) {
        return this.userService.findUserOfConv(data);
    }
    async update(id, updateUserDto) {
        const res = await this.userService.update(id, updateUserDto);
        return res;
    }
    async resetPassword(updateUserDto) {
        const res = await this.userService.resetPassword(updateUserDto);
        return res;
    }
    uploadProfilePhoto(file, myId) {
        return this.userService.uploadProfilePhoto(file, myId);
    }
    sendFile(fileId, res) {
        fs.access('assets/imagesOfConvs/' + fileId, fs.constants.F_OK, (err) => {
            if (err) {
                res.sendFile('/imagesOfConvs/user.png', { root: 'assets' });
            }
            else {
                res.sendFile('/imagesOfConvs/' + fileId, { root: 'assets' });
            }
        });
    }
    delete(id) {
        return this.userService.remove(id);
    }
    deleteAll() {
        return this.userService.deleteAll();
    }
    addReq(addReq) {
        return this.userService.addReq(addReq);
    }
    removeFriend(myId, friendId) {
        return this.userService.removeFriend(myId, friendId);
    }
    cancelFriend(myId, friendId) {
        return this.userService.cancel(myId, friendId);
    }
    refuse(myId, friendId) {
        return this.userService.refuseFriend(myId, friendId);
    }
    accept(myId, friendId) {
        return this.userService.accept(myId, friendId);
    }
    getMyFriends(id) {
        return this.userService.getMyFriends(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('login/:email/:password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('email')),
    __param(2, (0, common_1.Param)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/search/:key/:myid'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Param)('myid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "searched", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('/findreqSentToMe/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findreqSentToMe", null);
__decorate([
    (0, common_1.Post)('/ofConv'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findUserOfConv", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('/password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('/uploadProfilePhoto/:myId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: 'assets/imagesOfConvs/',
            filename: (req, file, callback) => {
                const randomName = Array(50)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return callback(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('myId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "uploadProfilePhoto", null);
__decorate([
    (0, common_1.Get)('/uploads/:fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "sendFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('/all/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteAll", null);
__decorate([
    (0, common_1.Post)('/friends'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "addReq", null);
__decorate([
    (0, common_1.Delete)('/friends/:myId/:friendId'),
    __param(0, (0, common_1.Param)('myId')),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.Delete)('/friends/cancel/:myId/:friendId'),
    __param(0, (0, common_1.Param)('myId')),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "cancelFriend", null);
__decorate([
    (0, common_1.Delete)('/friends/refuse/:myId/:friendId'),
    __param(0, (0, common_1.Param)('myId')),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "refuse", null);
__decorate([
    (0, common_1.Delete)('/friends/accept/:myId/:friendId'),
    __param(0, (0, common_1.Param)('myId')),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "accept", null);
__decorate([
    (0, common_1.Get)('/myFriends/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getMyFriends", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map