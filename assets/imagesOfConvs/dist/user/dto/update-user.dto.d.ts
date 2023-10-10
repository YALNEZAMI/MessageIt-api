import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    password2?: string;
    photo?: string;
    addReqs?: string[];
    friends?: string[];
    status?: string;
    codePassword?: number;
    lastConnection?: Date;
}
export {};
