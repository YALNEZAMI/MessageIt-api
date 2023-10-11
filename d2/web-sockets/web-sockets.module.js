"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketsModule = void 0;
const common_1 = require("@nestjs/common");
const web_sockets_service_1 = require("./web-sockets.service");
const web_sockets_controller_1 = require("./web-sockets.controller");
let WebSocketsModule = class WebSocketsModule {
};
exports.WebSocketsModule = WebSocketsModule;
exports.WebSocketsModule = WebSocketsModule = __decorate([
    (0, common_1.Module)({
        exports: [web_sockets_service_1.WebSocketsService],
        controllers: [web_sockets_controller_1.WebSocketsController],
        providers: [web_sockets_service_1.WebSocketsService],
    })
], WebSocketsModule);
//# sourceMappingURL=web-sockets.module.js.map