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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
let SessionService = class SessionService {
    constructor(userService) {
        this.userService = userService;
    }
    async setStatus(id, object) {
        setTimeout(async () => {
            const user = await this.userService.findOne(id);
            const lastConnection = user.lastConnection;
            const now = new Date();
            const diff = now - lastConnection;
            if (diff > 300000) {
                await this.userService.update(id, { status: 'offline' });
            }
        }, 305000);
        object.lastConnection = new Date();
        await this.userService.update(id, object);
        const res = await this.userService.findOne(id);
        delete res.password;
        delete res.email;
        delete res.codePassword;
        return res;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], SessionService);
//# sourceMappingURL=session.service.js.map