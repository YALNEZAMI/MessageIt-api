import { CreateConvDto } from './create-conv.dto';
declare const UpdateConvDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateConvDto>>;
export declare class UpdateConvDto extends UpdateConvDto_base {
    name?: string;
    photo?: string;
    description?: string;
    members?: any[];
    status?: string;
    theme?: string;
}
export {};
