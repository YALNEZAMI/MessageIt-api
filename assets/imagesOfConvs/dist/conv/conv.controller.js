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
exports.ConvController = void 0;
const common_1 = require("@nestjs/common");
const conv_service_1 = require("./conv.service");
const create_conv_dto_1 = require("./dto/create-conv.dto");
const update_conv_dto_1 = require("./dto/update-conv.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let ConvController = class ConvController {
    constructor(convService) {
        this.convService = convService;
    }
    create(createConvDto) {
        return this.convService.create(createConvDto);
    }
    convsOfUser(idUser) {
        return this.convService.convOfUser(idUser);
    }
    findAll() {
        return this.convService.findAll();
    }
    findOne(id) {
        return this.convService.findOne(id);
    }
    searched(key, myid) {
        return this.convService.searched(key, myid);
    }
    getMyConvs(id) {
        return this.convService.getMyConvs(id);
    }
    getMembers(idConv, myId) {
        return this.convService.getMembers(idConv, myId);
    }
    update(id, updateConvDto) {
        return this.convService.update(id, updateConvDto);
    }
    updatePhoto(id, file) {
        return this.convService.updatePhoto(id, file);
    }
    remove(id) {
        return this.convService.remove(id);
    }
    removeAll() {
        return this.convService.removeAll();
    }
    leave(id, idConv) {
        return this.convService.leaveConv(id, idConv);
    }
};
exports.ConvController = ConvController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conv_dto_1.CreateConvDto]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('/ofUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "convsOfUser", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('/search/:key/:myid'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Param)('myid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "searched", null);
__decorate([
    (0, common_1.Get)('/myConvs/:myid'),
    __param(0, (0, common_1.Param)('myid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "getMyConvs", null);
__decorate([
    (0, common_1.Get)('/members/:idConv/:myId'),
    __param(0, (0, common_1.Param)('idConv')),
    __param(1, (0, common_1.Param)('myId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_conv_dto_1.UpdateConvDto]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "update", null);
__decorate([
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
    (0, common_1.Patch)('photo/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "updatePhoto", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('/all/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "removeAll", null);
__decorate([
    (0, common_1.Delete)('/leave/:myId/:idConv'),
    __param(0, (0, common_1.Param)('myId')),
    __param(1, (0, common_1.Param)('idConv')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConvController.prototype, "leave", null);
exports.ConvController = ConvController = __decorate([
    (0, common_1.Controller)('conv'),
    __metadata("design:paramtypes", [conv_service_1.ConvService])
], ConvController);
//# sourceMappingURL=conv.controller.js.map