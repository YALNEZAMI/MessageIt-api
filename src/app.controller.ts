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
    res.redirect('http://localhost:4200/setGoogleUser?id=' + user._id);
  }
}
