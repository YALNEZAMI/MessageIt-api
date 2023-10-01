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
  async findMessageOfConv(idConv: string, skip: number) {
    console.log('skip', skip);

    const totalCount = await this.messageModel.countDocuments({ conv: idConv });
    console.log('totalCount', totalCount);
    let limit: number = 20;
    if (totalCount - skip < 20) {
      limit = totalCount - skip;
      if (limit < 0) return [];
    }
    let msgs: any;
    if (limit === 0) {
      msgs = await this.messageModel.find({ conv: idConv });
      return msgs;
    } else {
      msgs = await this.messageModel
        .find({ conv: idConv })
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .exec();

      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        const user = await this.userService.findeUserForMessage(msg.sender);
        msg.sender = user;
      }
    }
    console.log('msgs', msgs.length);

    return msgs.reverse();
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

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messageModel.updateOne({ _id: id }, updateMessageDto).exec();
  }
  remove(id: string): any {
    return this.messageModel.deleteMany({ _id: id }).exec();
  }
  removeAll(): any {
    return this.messageModel.deleteMany().exec();
  }
  removeAllFromConv(idConv: string): any {
    return this.messageModel.deleteMany({ conv: idConv }).exec();
  }
}
