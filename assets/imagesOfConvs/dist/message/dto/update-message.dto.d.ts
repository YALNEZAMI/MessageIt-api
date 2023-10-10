import { CreateMessageDto } from './create-message.dto';
declare const UpdateMessageDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateMessageDto>>;
export declare class UpdateMessageDto extends UpdateMessageDto_base {
    conv?: any;
    text?: string;
    files?: any[];
    date?: Date;
    ref?: string;
    visiblity?: string[];
    sender?: string;
    vus?: string[];
}
export {};
