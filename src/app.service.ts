import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
  constructor(private userService: UserService) {}
  getHello(): string {
    return 'Hello World!';
  }
  //auth by google
  async googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }
    return await this.userService.signUpWithGoogle(req.user);
  }
}
