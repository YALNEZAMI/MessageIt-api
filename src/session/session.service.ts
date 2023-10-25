/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';

@Injectable()
export class SessionService {
  constructor(
    private userService: UserService,
    private webSocketService: WebSocketsService,
  ) {
    console.log('session service started');
  }
  //set status to online for 5mins and return user
  async setStatus(id: string) {
    try {
      setTimeout(async () => {
        const user = await this.userService.findOne(id);
        const lastConnection: any = user.lastConnection;
        const now: any = new Date();
        const diff = now - lastConnection;
        if (diff > 300000) {
          await this.userService.update(id, { status: 'offline' });
        }
      }, 305000);
      await this.userService.update(id, {
        status: 'online',
        lastConnection: new Date(),
      });
      const finalUser = await this.userService.findConfidentialUser(id);
      //set online websocket
      this.webSocketService.statusChange(finalUser);
      return finalUser;
    } catch (error) {}
  }
  setStatusMannualy(id: string, body: any) {
    try {
      if (body.status === 'online') {
        this.setStatus(id);
      } else {
        this.userService.update(id, { status: body.status });
      }
      const finalUser = this.userService.findConfidentialUser(id);
      //set online websocket
      this.webSocketService.statusChange(finalUser);
    } catch (error) {}
  }
}
