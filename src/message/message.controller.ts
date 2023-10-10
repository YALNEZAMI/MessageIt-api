/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import { Response } from 'express';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { MessageService } from './message.service';
// import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: 'assets/imagesOfMessages/',
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
  create(@Body() message: any, @UploadedFiles() files: Express.Multer.File[]) {
    return this.messageService.create(message, files);
  }
  @Get('uploads/:fileId')
  sendFile(@Param('fileId') fileId: string, @Res() res: Response) {
    fs.access('assets/imagesOfMessages/' + fileId, fs.constants.F_OK, (err) => {
      if (err) {
        res.sendFile('/imagesOfMessages/deleted.png', { root: 'assets' });
        // Handle the case where the file does not exist
      } else {
        res.sendFile('/imagesOfMessages/' + fileId, { root: 'assets' });
        // Handle the case where the file exists
      }
    });
  }
  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }
  @Get('range/:idConv/:idMessage')
  getRange(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
  ) {
    return this.messageService.getRange(idConv, idMessage);
  }
  //MessageSearchedGroup/${idConv}/${range}
  @Get('MessageSearchedGroup/:idConv/:idMessage/:userId')
  getMessageSearchedGroup(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
    @Param('userId') userId: string,
  ) {
    return this.messageService.getMessageSearchedGroup(
      idConv,
      idMessage,
      userId,
    );
  }
  ///appendDown/${idConv}/${range}
  @Get('appendDown/:idConv/:idMessage/:userId')
  appendDown(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
    @Param('userId') userId: string,
  ) {
    return this.messageService.appendDown(idConv, idMessage, userId);
  }
  @Get('appendUp/:idConv/:idMessage/:userId')
  appendUp(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
    @Param('userId') userId: string,
  ) {
    return this.messageService.appendUp(idConv, idMessage, userId);
  }
  @Get('search/:key/:idConv/:idUser')
  getMessagesByKey(
    @Param('key') key: string,
    @Param('idConv') idConv: string,
    @Param('idUser') idUser: string,
  ) {
    return this.messageService.getMessagesByKey(key, idConv, idUser);
  }
  @Get('/ofConv/:idConv/:idUser')
  findMessageOfConv(
    @Param('idConv') idConv: string,
    @Param('idUser') idUser: string,
  ) {
    return this.messageService.findMessageOfConv(idConv, idUser);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }
  @Patch('/set/vus')
  setVus(@Body() body: any) {
    return this.messageService.setVus(body);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
  @Patch('delete/ForMe')
  deleteForMe(@Body() object: any) {
    //object:{idMsg:string,idUser:string,memberLength:number}
    return this.messageService.deleteForMe(object);
  }
  @Delete('/all/all')
  removeAll() {
    return this.messageService.removeAll();
  }
}
