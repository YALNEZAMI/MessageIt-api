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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("./user/user.module");
const mongoose_1 = require("@nestjs/mongoose");
const conv_module_1 = require("./conv/conv.module");
const message_module_1 = require("./message/message.module");
const web_sockets_module_1 = require("./web-sockets/web-sockets.module");
const session_module_1 = require("./session/session.module");
const mailer_module_1 = require("./mailer/mailer.module");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
    constructor() {
        console.log(process.env.mongo_url);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.env',
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRoot(process.env.mongo_url, {
                dbName: process.env.mongo_db_name,
            }),
            user_module_1.UserModule,
            conv_module_1.ConvModule,
            message_module_1.MessageModule,
            web_sockets_module_1.WebSocketsModule,
            session_module_1.SessionModule,
            mailer_module_1.MailerModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map