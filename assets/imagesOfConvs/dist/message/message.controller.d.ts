/// <reference types="multer" />
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
import { MessageService } from './message.service';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    create(message: any, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("./entities/message.entity").MessageDocument> & import("./entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./entities/message.entity").MessageDocument> & import("./entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findOne(id: string): any;
    getRange(idConv: string, idMessage: string): Promise<number>;
    getMessageSearchedGroup(idConv: string, idMessage: string, userId: string): Promise<any[]>;
    appendDown(idConv: string, idMessage: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/message.entity").MessageDocument> & import("./entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    appendUp(idConv: string, idMessage: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/message.entity").MessageDocument> & import("./entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getMessagesByKey(key: string, idConv: string, idUser: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/message.entity").MessageDocument> & import("./entities/message.entity").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findMessageOfConv(idConv: string, idUser: string): Promise<any[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): Promise<import("mongoose").UpdateWriteOpResult>;
    setVus(body: any): Promise<void>;
    remove(id: string): Promise<any>;
    deleteForMe(object: any): Promise<any>;
    removeAll(): any;
}
