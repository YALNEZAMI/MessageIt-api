"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvModule = void 0;
const common_1 = require("@nestjs/common");
const conv_service_1 = require("./conv.service");
const conv_controller_1 = require("./conv.controller");
const mongoose_1 = require("@nestjs/mongoose");
const conv_entity_1 = require("./entities/conv.entity");
const user_module_1 = require("../user/user.module");
const message_module_1 = require("../message/message.module");
const session_module_1 = require("../session/session.module");
let ConvModule = class ConvModule {
};
exports.ConvModule = ConvModule;
exports.ConvModule = ConvModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: conv_entity_1.Conv.name, schema: conv_entity_1.ConvSchema }]),
            user_module_1.UserModule,
            message_module_1.MessageModule,
            session_module_1.SessionModule,
        ],
        controllers: [conv_controller_1.ConvController],
        providers: [conv_service_1.ConvService],
    })
], ConvModule);
//# sourceMappingURL=conv.module.js.map