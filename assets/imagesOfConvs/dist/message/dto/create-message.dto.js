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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessageDto = void 0;
const typeorm_1 = require("typeorm");
let CreateMessageDto = class CreateMessageDto {
};
exports.CreateMessageDto = CreateMessageDto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Object)
], CreateMessageDto.prototype, "conv", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Object)
], CreateMessageDto.prototype, "files", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], CreateMessageDto.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "ref", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Array)
], CreateMessageDto.prototype, "visiblity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Array)
], CreateMessageDto.prototype, "vus", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "sender", void 0);
exports.CreateMessageDto = CreateMessageDto = __decorate([
    (0, typeorm_1.Entity)()
], CreateMessageDto);
//# sourceMappingURL=create-message.dto.js.map