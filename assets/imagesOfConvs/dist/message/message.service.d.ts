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
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';
import { SessionService } from 'src/session/session.service';
export declare class MessageService {
    private messageModel;
    private userService;
    private sessionService;
    private webSocketService;
    constructor(messageModel: Model<MessageDocument>, userService: UserService, sessionService: SessionService, webSocketService: WebSocketsService);
    create(object: any, files: any): Promise<import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findAllMessageOfConv(idConv: string): Promise<(import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    deleteForMe(object: any): Promise<any>;
    getMessageSearchedGroup(idConv: string, idMessage: string, userId: string): Promise<any[]>;
    findMessageOfConv(idConv: string, idUser: string): Promise<any[]>;
    fillSenderAndRef(messages: any[]): Promise<any[]>;
    getRange(idConv: string, idMessage: string, userId?: string): Promise<number>;
    getMessagesByKey(key: string, idConv: string, idUser: string): Promise<(import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOne(id: string): any;
    appendDown(idConv: string, idMessage: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    appendUp(idConv: string, idMessage: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): Promise<import("mongoose").UpdateWriteOpResult>;
    setVus(body: any): Promise<void>;
    remove(id: string): Promise<any>;
    removeAll(): any;
    removeAllFromConv(idConv: string): any;
}
