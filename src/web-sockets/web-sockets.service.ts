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
    origin: [process.env.frontUrl], // Adjust the origin to match your Angular app's URL
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
}
