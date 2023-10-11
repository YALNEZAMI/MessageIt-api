"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMailerDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_mailer_dto_1 = require("./create-mailer.dto");
class UpdateMailerDto extends (0, mapped_types_1.PartialType)(create_mailer_dto_1.CreateMailerDto) {
}
exports.UpdateMailerDto = UpdateMailerDto;
//# sourceMappingURL=update-mailer.dto.js.map