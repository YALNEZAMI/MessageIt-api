/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';
import { SessionService } from 'src/session/session.service';
import * as fs from 'fs';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    private userService: UserService,
    private sessionService: SessionService,
    private webSocketService: WebSocketsService,
  ) {}
  async create(object: any, files: any) {
    const createMessageDto: CreateMessageDto = JSON.parse(object.message);

    //set visibility
    createMessageDto.visibility = [];
    for (let i = 0; i < createMessageDto.conv.members.length; i++) {
      const member = createMessageDto.conv.members[i];
      createMessageDto.visibility.push(member._id);
    }

    //when we finish setting visibility, conv become a simple con _id
    createMessageDto.conv = createMessageDto.conv._id;
    //the sender is set to a viewer of his message here
    createMessageDto.vus = [];
    createMessageDto.vus.push(createMessageDto.sender);
    //set the user online
    await this.sessionService.setStatus(createMessageDto.sender);
    //files
    const filesNames = [];

    for (const file of files) {
      filesNames.push(
        process.env.api_url + '/message/uploads/' + file.filename,
      );
    }
    createMessageDto.files = filesNames;

    let msg = await this.messageModel.create(createMessageDto);
    let messages = [msg];
    messages = await this.fillSenderAndRef(messages);
    msg = messages[0];
    this.webSocketService.onNewMessage(msg);
    return msg;
  }

  findAll() {
    return this.messageModel.find().exec();
  }
  async findAllMessageOfConv(idConv: string) {
    let messages = await this.messageModel.find({ conv: idConv }).exec();
    // for (let i = 0; i < msgs.length; i++) {
    //   const msg = msgs[i];
    //   const user = await this.userService.findeUserForMessage(msg.sender);
    //   msg.sender = user;
    // }
    messages = await this.fillSenderAndRef(messages);

    return messages;
  }

  async getMessageSearchedGroup(
    idConv: string,
    idMessage: string,
    userId: string,
  ) {
    let range = await this.getRange(idConv, idMessage, userId);
    let messages = [];
    const totalCount = await this.messageModel.countDocuments({
      conv: idConv,
      visibility: { $in: [userId] },
    });
    let limit: number = 20;
    if (totalCount < 20) {
      messages = await this.messageModel
        .find({ conv: idConv, visibility: { $in: [userId] } })
        .exec();
    } else {
      if (range < 20) {
        range = 0;
      } else if (totalCount - range < 20) {
        limit = totalCount - range;
      } else {
        range -= 10;
        limit = 20;
      }
      messages = await this.messageModel
        .find({ conv: idConv })
        .skip(range)
        .limit(limit)
        .exec();
    }

    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillSenderAndRef(messages);
    return messages;
  }
  async findMessageOfConv(idConv: string, idUser: string) {
    const total = await this.messageModel.countDocuments({
      conv: idConv,
      visibility: { $in: [idUser] },
    });

    const limit = 20;
    const skip = total - limit;
    let messages = [];
    if (total < 20) {
      messages = await this.messageModel
        .find({ conv: idConv, visibility: { $in: [idUser] } })
        .exec();
    } else {
      messages = await this.messageModel
        .find({ conv: idConv, visibility: { $in: [idUser] } })
        .skip(skip)
        .limit(limit)
        .exec();
    }
    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillSenderAndRef(messages);

    return messages;
  }
  getMedias(idConv: string, idUser: string) {
    return this.messageModel
      .find({
        conv: idConv,
        visibility: { $in: [idUser] },
        files: { $exists: true, $ne: [] },
      })
      .exec();
  }
  async fillSenderAndRef(messages: any[]) {
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
      if (msg.ref != '') {
        const repMsg = await this.messageModel.findById(msg.ref);
        msg.ref = repMsg;
        const senderRef = await this.userService.findeUserForMessage(
          msg.ref.sender,
        );
        msg.ref.sender = senderRef;
      }
    }
    return messages;
  }
  async getRange(idConv: string, idMessage: string, userId?: string) {
    const all = await this.messageModel
      .find({ conv: idConv, visibility: { $in: [userId] } })
      .exec();
    const index = all.findIndex((msg) => msg._id == idMessage);
    return index;
  }
  async getMessagesByKey(key: string, idConv: string, idUser: string) {
    let messages = await this.messageModel
      .find({
        conv: idConv,
        visibility: { $in: [idUser] },
        text: { $regex: key, $options: 'i' },
      })
      .exec();
    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillSenderAndRef(messages);

    return messages;
  }
  findOne(id: string) {
    return this.findOne(id).exec();
  }
  async appendDown(idConv: string, idMessage: string, userId: string) {
    let range = await this.getRange(idConv, idMessage, userId);
    let limit: number = 20;
    const totalCount = await this.messageModel.countDocuments({
      conv: idConv,
      visibility: { $in: [userId] },
    });
    if (totalCount - range < 20) {
      range++;
      limit = totalCount - range;
    }

    let messages = await this.messageModel
      .find({ conv: idConv, visibility: { $in: [userId] } })
      .skip(range)
      .limit(limit)
      .exec();
    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillSenderAndRef(messages);

    return messages;
  }

  async appendUp(idConv: string, idMessage: string, userId: string) {
    let range = await this.getRange(idConv, idMessage, userId);
    if (range == 0) return [];
    let limit: number = 20;
    if (range < 20) {
      limit = range;
      range = 0;
    }

    let messages = await this.messageModel
      .find({ conv: idConv, visibility: { $in: [userId] } })
      .skip(range)
      .limit(limit)
      .exec();
    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillSenderAndRef(messages);

    return messages;
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messageModel.updateOne({ _id: id }, updateMessageDto).exec();
  }
  async setVus(body: any) {
    this.webSocketService.onSetVus(body);
    const id = body.myId;
    //set viewver as Oline
    this.sessionService.setStatus(id);
    const idConv = body.idConv;
    this.messageModel
      .updateMany({ conv: idConv }, { $addToSet: { vus: id } })
      .exec();
  }

  async remove(id: string): Promise<any> {
    const msg = await this.messageModel.findOne({ _id: id }).exec();
    const files = msg.files;
    for (let file of files) {
      file = file.split('/');
      file = file[file.length - 1];
      fs.access('assets/imagesOfMessages/' + file, fs.constants.F_OK, (err) => {
        if (err) {
          // Handle the case where the file does not exist
        } else {
          fs.unlink('assets/imagesOfMessages/' + file, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
          // Handle the case where the file exists
        }
      });
    }
  }
  async removeForAll(id: string, idUser: string): Promise<any> {
    const msg = await this.messageModel.findOne({ _id: id }).exec();
    if (msg.sender != idUser) return;
    const files = msg.files;
    for (let file of files) {
      file = file.split('/');
      file = file[file.length - 1];
      fs.access('assets/imagesOfMessages/' + file, fs.constants.F_OK, (err) => {
        if (err) {
          // Handle the case where the file does not exist
        } else {
          fs.unlink('assets/imagesOfMessages/' + file, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
          // Handle the case where the file exists
        }
      });
    }
    await this.messageModel.deleteMany({ _id: id }).exec();
    //object:{idMsg:string,idUser:string,memberLength:number,operation:'deleteForMe'||'deleteForAll}

    const obj = {
      idMsg: msg._id,
      idUser: msg.sender,
      operation: 'deleteForAll',
    };
    this.webSocketService.onMessageDeleted(obj);
    return obj;
  }
  async deleteForMe(object: any): Promise<any> {
    //object:{idMsg:string,idUser:string,memberLength:number,operation:'deleteForMe'||'deleteForAll}
    object.operation = 'deleteForMe';
    this.webSocketService.onMessageDeleted(object);
    const msg = await this.messageModel.findOne({ _id: object.idMsg }).exec();
    if (msg.visibility.length == 1) {
      return await this.remove(object.idMsg);
    }
    return this.messageModel
      .updateOne(
        { _id: object.idMsg },
        {
          $pull: { visibility: object.idUser },
        },
      )
      .exec();
  }
  async removeAll(): Promise<any> {
    const msgsWithMedias = await this.messageModel
      .find({ files: { $exists: true, $ne: [] } })
      .exec();
    for (const msg of msgsWithMedias) {
      const files = msg.files;
      for (let file of files) {
        file = file.split('/');
        file = file[file.length - 1];
        fs.access(
          'assets/imagesOfMessages/' + file,
          fs.constants.F_OK,
          (err) => {
            if (err) {
              // Handle the case where the file does not exist
            } else {
              fs.unlink('assets/imagesOfMessages/' + file, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
              });
              // Handle the case where the file exists
            }
          },
        );
      }
    }
    return this.messageModel.deleteMany().exec();
  }
  removeAllFromConv(idConv: string): any {
    return this.messageModel.deleteMany({ conv: idConv }).exec();
  }
}
