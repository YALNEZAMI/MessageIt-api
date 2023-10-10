/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { UploadedFileInterface } from 'src/interfaces/photo';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        status: number;
        message: string;
        user?: undefined;
    } | {
        status: number;
        message: string;
        user: import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    login(req: Request, email: string, password: string): Promise<any>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    searched(key: string, myid: string): Promise<any>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findreqSentToMe(id: string): Promise<any[]>;
    findUserOfConv(data: any): Promise<(import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    resetPassword(updateUserDto: UpdateUserDto): Promise<{
        status: number;
        message: string;
    }>;
    uploadProfilePhoto(file: UploadedFileInterface, myId: string): Promise<{
        photo: string;
    }>;
    sendFile(fileId: string, res: Response): void;
    delete(id: string): Promise<any>;
    deleteAll(): any;
    addReq(addReq: any): import("mongoose").Query<import("mongoose").UpdateWriteOpResult, import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("./entities/user.entity").UserDocument, "updateOne">;
    removeFriend(myId: string, friendId: string): Promise<import("mongoose").UpdateWriteOpResult>;
    cancelFriend(myId: string, friendId: string): import("mongoose").Query<import("mongoose").UpdateWriteOpResult, import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("./entities/user.entity").UserDocument, "updateOne">;
    refuse(myId: string, friendId: string): import("mongoose").Query<import("mongoose").UpdateWriteOpResult, import("mongoose").Document<unknown, {}, import("./entities/user.entity").UserDocument> & import("./entities/user.entity").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("./entities/user.entity").UserDocument, "updateOne">;
    accept(myId: string, friendId: string): Promise<{
        firstAdd: import("mongoose").UpdateWriteOpResult;
        secAdd: import("mongoose").UpdateWriteOpResult;
    }>;
    getMyFriends(id: string): Promise<any>;
}
