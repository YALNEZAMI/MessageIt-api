/* eslint-disable prettier/prettier */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { config } from 'dotenv';
config();
@WebSocketGateway({
  cors: {
    origin: [process.env.frontUrl],
  },
})
export class WebSocketsService {
  constructor() {}
  @WebSocketServer()
  server: Server;
  //when a new connection occurs, the server logs ‘new connection’ message
  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log(socket.id);
  //     console.log('new connection');
  //   });
  // }
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    this.server.emit('newMessage', body);
  }

  @SubscribeMessage('setVus')
  onSetVus(@MessageBody() body: any) {
    this.server.emit('setVus', body);
  }

  @SubscribeMessage('messageDeleted')
  onMessageDeleted(@MessageBody() id: any) {
    this.server.emit('messageDeleted', id);
  }
  @SubscribeMessage('typing')
  typing(@MessageBody() object: any) {
    //object:{idConv:string,user:any}
    this.server.emit('typing', object);
  }
  @SubscribeMessage('addFriend')
  addFriend(@MessageBody() object: any) {
    this.server.emit('addFriend', object);
  }
  @SubscribeMessage('cancelFriend')
  cancelFriend(@MessageBody() object: any) {
    this.server.emit('cancelFriend', object);
  }
  @SubscribeMessage('acceptFriend')
  acceptFriend(@MessageBody() object: any) {
    this.server.emit('acceptFriend', object);
  }
  @SubscribeMessage('lastMsg')
  lastMsg(@MessageBody() msg: any) {
    this.server.emit('lastMsg', msg);
  }
  @SubscribeMessage('removeFromGroupe')
  onRemoveFromGroupe(@MessageBody() object: { idUser: string; conv: any }) {
    this.server.emit('removeFromGroupe', object);
  }
  @SubscribeMessage('createConv')
  OnCreateConv(@MessageBody() conv: any) {
    this.server.emit('createConv', conv);
  }
  @SubscribeMessage('addMemberToGroupe')
  onAddMemberToGroupe(@MessageBody() convAndNewMembers: any) {
    this.server.emit('addMemberToGroupe', convAndNewMembers);
  }
  @SubscribeMessage('leaveConv')
  onLeavingConv(@MessageBody() message: { conv: any; leaver: any }) {
    this.server.emit('leaveConv', message);
  }
  @SubscribeMessage('recievedMessage')
  onRecievedMessage(@MessageBody() message: any) {
    this.server.emit('recievedMessage', message);
  }
  @SubscribeMessage('login')
  login(@MessageBody() user: any) {
    this.server.emit('login', user);
  }
  @SubscribeMessage('reaction')
  reaction(@MessageBody() reaction: any) {
    this.server.emit('reaction', reaction);
  }
  @SubscribeMessage('statusChange')
  statusChange(@MessageBody() user: any) {
    this.server.emit('statusChange', user);
  }

  @SubscribeMessage('upgardingToAdmin')
  upgardingToAdmin(@MessageBody() conv: any) {
    this.server.emit('upgardingToAdmin', conv);
  }
  @SubscribeMessage('upgardingToChef')
  upgardingToChef(@MessageBody() conv: any) {
    this.server.emit('upgardingToChef', conv);
  }
  @SubscribeMessage('downgardingAdmin')
  downgardingAdmin(@MessageBody() conv: any) {
    this.server.emit('downgardingAdmin', conv);
  }
  @SubscribeMessage('someConvChanged')
  someConvChanged(@MessageBody() conv: any) {
    this.server.emit('someConvChanged', conv);
  }
  @SubscribeMessage('onRemoveFriend')
  onRemoveFriend(@MessageBody() obj: { remover: string; removed: string }) {
    this.server.emit('onRemoveFriend', obj);
  }
  @SubscribeMessage('someUserUpdated')
  someUserUpdated(@MessageBody() user: any) {
    this.server.emit('onSomeUserUpdated', user);
  }
}
