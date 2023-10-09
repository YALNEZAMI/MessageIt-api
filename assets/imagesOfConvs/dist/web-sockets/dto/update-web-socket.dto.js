"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWebSocketDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_web_socket_dto_1 = require("./create-web-socket.dto");
class UpdateWebSocketDto extends (0, mapped_types_1.PartialType)(create_web_socket_dto_1.CreateWebSocketDto) {
}
exports.UpdateWebSocketDto = UpdateWebSocketDto;
//# sourceMappingURL=update-web-socket.dto.js.map