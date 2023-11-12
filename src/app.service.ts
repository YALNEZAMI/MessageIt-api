/* eslint-disable prettier/prettier */
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
  //auth by facebook
  async facebookLogin(req: any) {
    if (!req.user) {
      return 'No user from facebook';
    }
    return await this.userService.signUpWithFacebook(req.user);
  }
  //auth by github
  async githubLogin(req: any) {
    if (!req.user) {
      return 'No user from github';
    }
    return await this.userService.signUpWithGithub(req.user);
  }
}
