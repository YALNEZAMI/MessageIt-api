/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';

@Injectable()
export class SessionService {
  periode: number = +process.env.CHECK_USER_STATUS_INTERVAL_TIME_MIN;
  constructor(
    private userService: UserService,
    private webSocketService: WebSocketsService,
  ) {
    //every 5mins ,set all as offline
    setInterval(
      async () => {
        const users = await this.userService.findAll();
        users.forEach(async (user) => {
          const lastConnection: any = user.lastConnection;
          const now: any = new Date();
          const diff = now - lastConnection;
          if (diff > 1000 * 60 * this.periode) {
            await this.userService.update(user._id, { status: 'offline' });
            console.log('offlined');
          }
        });
      },
      1000 * 60 * this.periode + 1000,
    );
  }
  //set status to online for 5mins and return user
  async setStatusOnline(id: string) {
    try {
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
  async setStatusMannualy(id: string, body: any) {
    try {
      if (body.status === 'online') {
        this.setStatusOnline(id);
      } else {
        this.userService.update(id, { status: body.status });
        const finalUser = await this.userService.findConfidentialUser(id);
        //set online websocket
        this.webSocketService.statusChange(finalUser);
      }
    } catch (error) {}
  }
}
