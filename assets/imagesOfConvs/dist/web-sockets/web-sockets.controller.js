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
exports.WebSocketsController = void 0;
const common_1 = require("@nestjs/common");
const web_sockets_service_1 = require("./web-sockets.service");
let WebSocketsController = class WebSocketsController {
    constructor(webSocketsService) {
        this.webSocketsService = webSocketsService;
    }
};
exports.WebSocketsController = WebSocketsController;
exports.WebSocketsController = WebSocketsController = __decorate([
    (0, common_1.Controller)('web-sockets'),
    __metadata("design:paramtypes", [web_sockets_service_1.WebSocketsService])
], WebSocketsController);
//# sourceMappingURL=web-sockets.controller.js.map