// import { Injectable } from '@nestjs/common';
// import { CreateWebSocketDto } from './dto/create-web-socket.dto';
// import { UpdateWebSocketDto } from './dto/update-web-socket.dto';
import { env } from '../env';
// import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: [env.frontUrl], // Adjust the origin to match your Angular app's URL
  },
})
export class WebSocketsService {
  @WebSocketServer()
  server: Server;
  //when a new connection occurs, the server logs ‘new connection’ message
  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log(socket.id);
  //     console.log('new connection');
  //   });
  // }
  //declaration of an event called ‘userAdded’ which can be used within methods(like methods dealing with http requests)
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    this.server.emit('newMessage', body);
  }

  // create(createWebSocketDto: CreateWebSocketDto) {
  //   return 'This action adds a new webSocket';
  // }
  // findAll() {
  //   return `This action returns all webSockets`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} webSocket`;
  // }
  // update(id: number, updateWebSocketDto: UpdateWebSocketDto) {
  //   return `This action updates a #${id} webSocket`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} webSocket`;
  // }
  @SubscribeMessage('newMessage')
  onMessageDeleted(@MessageBody() id: any) {
    this.server.emit('messageDeleted', id);
  }
}
