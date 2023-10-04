/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    private userService: UserService,
    private webSocketService: WebSocketsService,
  ) {}
  async create(createMessageDto: CreateMessageDto) {
    //set the user online
    await this.userService.setStatus(createMessageDto.sender, {
      status: 'online',
    });
    if (createMessageDto.text === '') {
      return;
    }
    const msg = await this.messageModel.create(createMessageDto);
    msg.sender = await this.userService.findeUserForMessage(msg.sender);
    this.webSocketService.onNewMessage(msg);
    return msg;
  }

  findAll() {
    return this.messageModel.find().exec();
  }
  async findAllMessageOfConv(idConv: string) {
    const msgs = await this.messageModel.find({ conv: idConv }).exec();
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }

    return msgs;
  }
  async getMessageSearchedGroup(idConv: string, idMessage: string) {
    let range = await this.getRange(idConv, idMessage);
    let messages = [];
    const totalCount = await this.messageModel.countDocuments({ conv: idConv });
    let limit: number = 20;
    if (totalCount < 20) {
      messages = await this.messageModel.find({ conv: idConv });
    } else {
      if (range < 20) {
        range = 0;
      } else if (totalCount - range < 20) {
        limit = totalCount - range;
      } else {
        range -= 10;
        limit = 20;
      }
    }
    messages = await this.messageModel
      .find({ conv: idConv })
      .skip(range)
      .limit(limit)
      .exec();

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }
    return messages;
  }
  async findMessageOfConv(idConv: string) {
    const total = await this.messageModel.countDocuments({ conv: idConv });
    const limit = 20;
    const skip = total - limit;
    let messages = [];
    if (total < 20) {
      messages = await this.messageModel.find({ conv: idConv }).exec();
    } else {
      messages = await this.messageModel
        .find({ conv: idConv })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }

    return messages;
  }
  async getRange(idConv: string, idMessage: string) {
    const all = await this.messageModel.find({ conv: idConv }).exec();
    const index = all.findIndex((msg) => msg._id == idMessage);
    return index;
  }
  async getMessagesByKey(key: string) {
    const messages = await this.messageModel
      .find({
        text: { $regex: key, $options: 'i' },
      })
      .exec();
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }

    return messages;
  }
  findOne(id: string) {
    return this.findOne(id).exec();
  }
  async appendDown(idConv: string, idMessage: string) {
    let range = await this.getRange(idConv, idMessage);
    let limit: number = 20;
    const totalCount = await this.messageModel.countDocuments({ conv: idConv });
    if (totalCount - range < 20) {
      range++;
      limit = totalCount - range;
    }

    const messages = await this.messageModel
      .find({ conv: idConv })
      .skip(range)
      .limit(limit)
      .exec();
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }

    return messages;
  }

  async appendUp(idConv: string, idMessage: string) {
    let range = await this.getRange(idConv, idMessage);
    if (range == 0) return [];
    let limit: number = 20;
    if (range < 20) {
      limit = range;
      range = 0;
    }

    const messages = await this.messageModel
      .find({ conv: idConv })
      .skip(range)
      .limit(limit)
      .exec();
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const user = await this.userService.findeUserForMessage(msg.sender);
      msg.sender = user;
    }

    return messages;
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messageModel.updateOne({ _id: id }, updateMessageDto).exec();
  }
  async setVus(body: any) {
    this.webSocketService.onSetVus(body);
    const id = body.myId;
    const idConv = body.idConv;
    this.messageModel
      .updateMany({ conv: idConv }, { $addToSet: { vus: id } })
      .exec();
  }

  remove(id: string): any {
    this.webSocketService.onMessageDeleted(id);
    return this.messageModel.deleteMany({ _id: id }).exec();
  }
  removeAll(): any {
    return this.messageModel.deleteMany().exec();
  }
  removeAllFromConv(idConv: string): any {
    return this.messageModel.deleteMany({ conv: idConv }).exec();
  }
}
