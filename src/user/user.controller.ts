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
// import { env } from 'src/env';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('create trigered');

    return this.userService.create(createUserDto);
  }

  @Get('login/:email/:password')
  login(@Param('email') email: string, @Param('password') password: string) {
    console.log('login trigered');
    const data = {
      email: email,
      password: password,
    };
    return this.userService.login(data);
  }

  @Get()
  findAll() {
    console.log('find all trigered');

    return this.userService.findAll();
  }
  @Get('/search/:key/:id')
  searched(@Param('key') key: string, @Param('id') id: string) {
    console.log('search trigered');
    if (id == 'undefined') {
      return null;
    }
    return this.userService.searched(key, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('find one trigered');
    if (id == 'undefined') {
      return null;
    }
    return this.userService.findOne(id);
  }
  @Get('/findreqSentToMe/:id')
  friendReqSentToMe(@Param('id') id: string) {
    console.log('friendReqSentToMe triggered for ', id);
    if (id == 'undefined') {
      console.log('id is undefined');

      return null;
    }
    return this.userService.findreqSentToMe(id);
  }

  @Post('/ofConv')
  findUserOfConv(@Body() data: any) {
    console.log('findUserOfConv trigered');
    return this.userService.findUserOfConv(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('update trigered');

    const res = await this.userService.update(id, updateUserDto);

    return res;
  }

  @Patch('/password/reset')
  async resetPassword(@Body() updateUserDto: UpdateUserDto) {
    console.log('resetPassword trigered');
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
    console.log('sendFile trigered');

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
    console.log('delete trigered');

    return this.userService.remove(id);
  }
  @Delete('/all/all')
  deleteAll() {
    console.log('deleteAll trigered');

    return this.userService.deleteAll();
  }

  //friend part
  @Post('/friends')
  addReq(@Body() addReq: any) {
    console.log('addReq trigered');

    return this.userService.addReq(addReq);
  }
  @Delete('/friends/:myId/:friendId')
  removeFriend(
    @Param('myId') myId: string,
    @Param('friendId') friendId: string,
  ) {
    console.log('removeFriend trigered');

    return this.userService.removeFriend(myId, friendId);
  }
  @Delete('/friends/cancel/:myId/:friendId')
  cancelFriend(
    @Param('myId') myId: string,
    @Param('friendId') friendId: string,
  ) {
    console.log('cancelFriend trigered');

    return this.userService.cancel(myId, friendId);
  }
  @Delete('/friends/refuse/:myId/:friendId')
  refuse(@Param('myId') myId: string, @Param('friendId') friendId: string) {
    console.log('refuse trigered');
    return this.userService.refuseFriend(myId, friendId);
  }
  @Delete('/friends/accept/:myId/:friendId')
  accept(@Param('myId') myId: string, @Param('friendId') friendId: string) {
    console.log('accept trigered');
    return this.userService.accept(myId, friendId);
  }
  @Get('/myFriends/:id')
  getMyFriends(@Param('id') id: string) {
    console.log('getMyFriends trigered');
    return this.userService.getMyFriends(id);
  }
  //     return this.Http.get(`${this.uri}/user/friendsToAdd/${this.getMyId()}/${this.getThisConv()._id}`);
  @Post('friendsToAdd/:idUser')
  friendsToAdd(@Param('idUser') idUser: string, @Body() members: string[]) {
    console.log('friendsToAdd trigered');
    return this.userService.friendsToAdd(idUser, members);
  }
}
