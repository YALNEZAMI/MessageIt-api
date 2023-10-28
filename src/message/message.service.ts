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
import { ReactionService } from 'src/reaction/reaction.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    private userService: UserService,
    private sessionService: SessionService,
    private webSocketService: WebSocketsService,
    private reactionService: ReactionService,
  ) {}
  async create(object: any, files: any) {
    let createMessageDto: CreateMessageDto = JSON.parse(object.message);
    //set typeMsg
    createMessageDto.typeMsg = 'message';
    //encrypt text
    createMessageDto = this.encrypteOne(createMessageDto);
    //set visibility
    createMessageDto.visibility = [];
    createMessageDto.conv.members.map((currentMember: any) => {
      createMessageDto.visibility.push(currentMember._id);
    });

    //when we finish setting visibility, conv become a simple con _id
    createMessageDto.conv = createMessageDto.conv._id;
    //the sender is set to a viewer of his message here
    createMessageDto.vus = [];
    createMessageDto.vus.push(createMessageDto.sender);
    //set the user online
    await this.sessionService.setStatus(createMessageDto.sender);
    //files
    const filesNames = [];

    files.map((file: any) => {
      filesNames.push(
        process.env.api_url + '/message/uploads/' + file.filename,
      );
    });
    createMessageDto.files = filesNames;

    let msg = await this.messageModel.create(createMessageDto);
    let messages = [msg];
    messages = await this.fillFields(messages);
    msg = messages[0];
    //decrypt text
    msg = this.decryptOne(msg);
    //set lastmsg event to update convs last message
    this.webSocketService.lastMsg(msg);
    //set new message event to update convs msgs
    this.webSocketService.onNewMessage(msg);
    return msg;
  }
  async fillNotifInfos(notif: any) {
    notif.text = '';
    notif.ref = '';
    notif.files = [];
    notif.vus = [notif.maker];
    notif.date = new Date();

    //stringify visibility
    notif.visibility = notif.visibility.map((member: any) => {
      if (typeof member == 'string') return member;
      member.toString();
      return member;
    });
    return notif;
  }
  async fillMakerAndRecieverOfNotif(notif: any) {
    notif.maker = await this.userService.findConfidentialUser(notif.maker);
    if (notif.reciever != undefined) {
      notif.reciever = await this.userService.findConfidentialUser(
        notif.reciever,
      );
    }
    return notif;
  }
  async createNotif(notif: any) {
    notif = await this.fillNotifInfos(notif);

    let creating = await this.messageModel.create(notif);
    //fill maker and reciever
    creating = await this.fillMakerAndRecieverOfNotif(creating);

    this.webSocketService.onNewMessage(creating);
  }
  encrypteOne(msg: any) {
    if (msg == null) return null;
    const iv = process.env.INIT_VECTOR;
    const key = process.env.ENCRYPT_KEY;
    msg.text = CryptoJS.AES.encrypt(msg.text, key, { iv }).toString();
    return msg;
  }
  decryptOne(msg: any) {
    if (msg == null) return null;

    if (msg.typeMsg == 'message') {
      const key = process.env.ENCRYPT_KEY;
      const iv = process.env.INIT_VECTOR;
      msg.text = CryptoJS.AES.decrypt(msg.text, key, { iv }).toString(
        CryptoJS.enc.Utf8,
      );
      return msg;
    } else {
      return msg;
    }
  }
  decrypt(messages: any[]) {
    const key = process.env.ENCRYPT_KEY;
    const iv = process.env.INIT_VECTOR;
    messages.map((msg) => {
      if (msg == null) return null;

      if (msg.typeMsg == 'message') {
        msg.text = CryptoJS.AES.decrypt(msg.text, key, { iv }).toString(
          CryptoJS.enc.Utf8,
        );
      }
    });
    return messages;
  }
  async getVisibleMessages(idConv: string, idUser: string) {
    let messages = await this.messageModel
      .find({ conv: idConv, visibility: { $in: [idUser] } })
      .exec();
    //decrypte
    messages = this.decrypt(messages);

    return messages;
  }
  async getLastMessage(idConv: string, idUser: string) {
    const messages: any = await this.messageModel.find({
      conv: idConv,
      visibility: { $in: [idUser] },
      typeMsg: 'message',
    });
    //null case
    if (messages.length == 0) return null;
    let message = messages[messages.length - 1];
    //decrypte
    message = this.decryptOne(message);

    return message;
  }
  findAll() {
    return this.messageModel.find().exec();
  }
  async findAllMessageOfConv(idConv: string) {
    let messages = await this.messageModel.find({ conv: idConv }).exec();
    messages = await this.fillFields(messages);
    return messages;
  }
  async setRecievedBy(body: { idReciever: string; idMessage: string }) {
    await this.messageModel
      .updateOne(
        { _id: body.idMessage },
        { $addToSet: { recievedBy: body.idReciever } },
      )
      .exec();

    let message = await this.messageModel.findById(body.idMessage).exec();
    if (message == null) {
      return;
    }
    //decrypte message text
    message = this.decryptOne(message);
    //set recievedBy event to update convs msgs
    this.webSocketService.onRecievedMessage(message);
    //set sender
    message.sender = await this.userService.findConfidentialUser(
      message.sender,
    );
    //set ref
    if (message.ref != '' && message.ref != null && message.ref != undefined) {
      message.ref = await this.messageModel.findById(message.ref);
    }

    return message;
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

    if (totalCount <= 20) {
      messages = await this.messageModel
        .find({ $and: [{ conv: idConv }, { visibility: { $in: [userId] } }] })
        .exec();
    } else {
      if (totalCount - range < 20) {
        range = totalCount - 10;
        limit = 10;
      }
      messages = await this.messageModel
        .find({ $and: [{ conv: idConv }, { visibility: { $in: [userId] } }] })
        .skip(range)
        .limit(limit)
        .exec();
    }

    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillFields(messages);
    //decrypte
    messages = this.decrypt(messages);

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

    messages = await this.fillFields(messages);

    //decrypte
    messages = this.decrypt(messages);

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
  async fillFields(messages: any[]): Promise<any[]> {
    const res = await Promise.all(
      messages.map(async (msg) => {
        //set user
        const user = await this.userService.findConfidentialUser(msg.sender);
        msg.sender = user;
        //set ref
        if (msg.ref != '') {
          let repMsg = await this.messageModel.findById(msg.ref);
          //decrypte message text
          repMsg = this.decryptOne(repMsg);
          msg.ref = repMsg;
          const senderRef = await this.userService.findConfidentialUser(
            msg.ref.sender,
          );
          msg.ref.sender = senderRef;
        }
        //set reactions
        const reactions = await this.reactionService.findAllOfMessage(
          msg._id.toString(),
        );
        msg.reactions = await Promise.all(
          reactions.map(async (reaction) => {
            reaction.user = await this.userService.findConfidentialUser(
              reaction.user,
            );
            return reaction;
          }),
        );
        return msg;
      }),
    );
    return res;
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
        // text: { $regex: key, $options: 'i' },
      })
      .exec();
    //decrypte
    messages = this.decrypt(messages);
    messages = messages.filter((msg) =>
      msg.text.toLowerCase().includes(key.toLowerCase()),
    );
    //replace sender<string> by sender<user>
    //replace ref<strg> by ref<message> and its sender<string> by sender<user>
    messages = await this.fillFields(messages);

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
    messages = await this.fillFields(messages);
    //decrypte
    messages = this.decrypt(messages);

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
    messages = await this.fillFields(messages);
    //decrypte
    messages = this.decrypt(messages);

    return messages;
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return this.messageModel.updateOne({ _id: id }, updateMessageDto).exec();
  }
  async setVus(body: { myId: string; idConv: string }) {
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
    files.map((file) => {
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
    });
    //delete reactions
    await this.reactionService.removeAllOfMsg(id);
    //delete message
    return await this.messageModel.deleteOne({ _id: id }).exec();
  }
  async removeForAll(id: string, idUser: string): Promise<any> {
    const msg = await this.messageModel.findOne({ _id: id }).exec();
    if (msg.sender != idUser) return;
    const files = msg.files;
    files.map((file) => {
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
    });
    //delete reactions
    await this.reactionService.removeAllOfMsg(id);
    //delete message
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
  async pullFromVisibilityOfConv(idConv: string, idUser: string) {
    return await this.messageModel
      .updateMany(
        {
          conv: idConv,
          visibility: { $in: [idUser] },
        },
        {
          $pull: { visibility: idUser },
        },
      )
      .exec();
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
    msgsWithMedias.map((msg) => {
      const files = msg.files;
      files.map((file) => {
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
      });
    });
    return this.messageModel.deleteMany().exec();
  }
  removeAllFromConv(idConv: string): any {
    return this.messageModel.deleteMany({ conv: idConv }).exec();
  }
}
