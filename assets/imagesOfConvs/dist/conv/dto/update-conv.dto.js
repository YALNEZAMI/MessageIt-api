"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConvDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_conv_dto_1 = require("./create-conv.dto");
class UpdateConvDto extends (0, mapped_types_1.PartialType)(create_conv_dto_1.CreateConvDto) {
}
exports.UpdateConvDto = UpdateConvDto;
//# sourceMappingURL=update-conv.dto.js.map