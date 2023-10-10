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
exports.MailerController = void 0;
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("./mailer.service");
const create_mailer_dto_1 = require("./dto/create-mailer.dto");
let MailerController = class MailerController {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    create(createMailerDto) {
        return this.mailerService.sendPasswordCode(createMailerDto);
    }
};
exports.MailerController = MailerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mailer_dto_1.CreateMailerDto]),
    __metadata("design:returntype", void 0)
], MailerController.prototype, "create", null);
exports.MailerController = MailerController = __decorate([
    (0, common_1.Controller)('mailer'),
    __metadata("design:paramtypes", [mailer_service_1.MailerService])
], MailerController);
//# sourceMappingURL=mailer.controller.js.map