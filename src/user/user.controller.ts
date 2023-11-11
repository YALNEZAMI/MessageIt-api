/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// import * as path from 'path';
import { Response } from 'express';
import { UploadedFileInterface } from 'src/interfaces/photo';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('login/:email/:password')
  login(@Param('email') email: string, @Param('password') password: string) {
    const data = {
      email: email,
      password: password,
    };
    return this.userService.login(data);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('/search/:key/:id')
  searched(@Param('key') key: string, @Param('id') id: string) {
    if (id == 'undefined') {
      return null;
    }
    return this.userService.searched(key, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (id == 'undefined') {
      return null;
    }
    return this.userService.findById(id);
  }
  @Get('findForOtherAuthWays/:id')
  findForOtherAuthWays(@Param('id') id: string) {
    if (id == 'undefined') {
      return null;
    }
    return this.userService.findForOtherAuthWays(id);
  }
  @Get('/findreqSentToMe/:id')
  getNotifs(@Param('id') id: string) {
    if (id == 'undefined') {
      return null;
    }
    return this.userService.getNotifs(id);
  }

  @Post('/ofConv')
  findUserOfConv(@Body() data: any) {
    return this.userService.findUserOfConv(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const res = await this.userService.update(id, updateUserDto);
    return res;
  }
  @Patch('resetAccepters/:id')
  resetAccepters(@Param('id') id: string) {
    return this.userService.resetAccepters(id);
  }
  @Patch('/password/reset')
  async resetPassword(@Body() updateUserDto: UpdateUserDto) {
    const res = await this.userService.resetPassword(updateUserDto);
    return res;
  }
  //Profile image upload
  @Post('/uploadProfilePhoto/:myId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'assets/imagesOfConvs/',
        filename: (req, file, callback) => {
          const randomName = Array(50)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadProfilePhoto(
    @UploadedFile() file: UploadedFileInterface,
    @Param('myId') myId: string,
  ) {
    return this.userService.uploadProfilePhoto(file, myId);
  }
  @Get('/uploads/:fileId')
  sendFile(@Param('fileId') fileId: string, @Res() res: Response) {
    fs.access('assets/imagesOfConvs/' + fileId, fs.constants.F_OK, (err) => {
      if (err) {
        res.sendFile('/imagesOfConvs/user.png', { root: 'assets' });
        // Handle the case where the file does not exist
      } else {
        res.sendFile('/imagesOfConvs/' + fileId, { root: 'assets' });
        // Handle the case where the file exists
      }
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.remove(id);
  }
  // @Delete('/all/all')
  // deleteAll() {
  //   return this.userService.deleteAll();
  // }

  //friend part
  @Post('/friends')
  addReq(@Body() addReq: any) {
    return this.userService.addReq(addReq);
  }
  @Delete('/friends/:myId/:friendId')
  removeFriend(
    @Param('myId') myId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.userService.removeFriend(myId, friendId);
  }
  @Delete('/friends/cancel/:myId/:friendId')
  cancelFriend(
    @Param('myId') myId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.userService.cancel(myId, friendId);
  }
  @Delete('/friends/refuse/:myId/:friendId')
  refuse(@Param('myId') myId: string, @Param('friendId') friendId: string) {
    return this.userService.refuseFriend(myId, friendId);
  }
  @Delete('/friends/accept/:myId/:friendId')
  accept(@Param('myId') myId: string, @Param('friendId') friendId: string) {
    return this.userService.accept(myId, friendId);
  }
  @Get('/myFriends/:id')
  getMyFriends(@Param('id') id: string) {
    return this.userService.getMyFriends(id);
  }
  //     return this.Http.get(`${this.uri}/user/friendsToAdd/${this.getMyId()}/${this.getThisConv()._id}`);
  @Post('friendsToAdd/:idUser')
  friendsToAdd(@Param('idUser') idUser: string, @Body() members: string[]) {
    return this.userService.friendsToAdd(idUser, members);
  }
}
