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
/// <reference types="mongoose/types/inferschematype" />
import { CreateConvDto } from './dto/create-conv.dto';
import { UpdateConvDto } from './dto/update-conv.dto';
import { Model } from 'mongoose';
import { Conv, ConvDocument } from './entities/conv.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { SessionService } from 'src/session/session.service';
export declare class ConvService {
    private ConvModel;
    private readonly userService;
    private messageService;
    private sessionService;
    constructor(ConvModel: Model<ConvDocument>, userService: UserService, messageService: MessageService, sessionService: SessionService);
    convExistBetween(id1: string, id2: string): Promise<{
        bool: boolean;
        idConv: any;
    }>;
    convOfUser(idUser: string): Promise<(import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    create(createConvDto: CreateConvDto): Promise<import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    addOptionsToUsers(users: any[], myid: string): Promise<any[]>;
    getMembers(idConv: string, myId: string): Promise<any[]>;
    getLastMessage(idConv: string): Promise<import("mongoose").Document<unknown, {}, import("../message/entities/message.entity").MessageDocument> & import("../message/entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getMyConvs(id: string): Promise<(import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    searched(key: string, myid: string): Promise<any>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    update(id: string, updateConvDto: UpdateConvDto): Promise<import("mongoose").Document<unknown, {}, ConvDocument> & Conv & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updatePhoto(id: string, photo: any): Promise<{
        photo: string;
    }>;
    remove(id: string): Promise<any>;
    removeAll(): any;
    leaveConv(id: string, idConv: string): Promise<any>;
    leaveAllConv(id: string): Promise<any>;
}
