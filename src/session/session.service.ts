/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionService {
  constructor(private userService: UserService) {}
  async setStatus(id: string) {
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
    const res = await this.userService.findOne(id);
    delete res.password;
    delete res.email;
    delete res.codePassword;
    return res;
  }
  setStatusMannualy(id: string, body: any) {
    if (body.status === 'online') {
      this.setStatus(id);
    } else {
      this.userService.update(id, { status: body.status });
    }
  }
}
