/* eslint-disable prettier/prettier */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //google auth endpoints
  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    console.log('googleAuth', req);
  }

  //google auth endpoints
  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = await this.appService.googleLogin(req);
    res.redirect(process.env.frontUrl + '/setUser?id=' + user._id);
  }

  //facebook auth endpoints
  @Get('auth/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: any) {
    console.log('facebookAuth', req);
  }

  //google auth endpoints
  @Get('auth/facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = await this.appService.facebookLogin(req);
    const id = user._id.toString();
    res.redirect(process.env.frontUrl + `/setUser?id=${id}`);
  }
}
