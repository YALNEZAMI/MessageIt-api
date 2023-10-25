/* eslint-disable prettier/prettier */
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
} from '@nestjs/common';
import { ConvService } from './conv.service';
import { CreateConvDto } from './dto/create-conv.dto';
import { UpdateConvDto } from './dto/update-conv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadedFileInterface } from 'src/interfaces/photo';
//controller of conversation endpoints
@Controller('conv')
export class ConvController {
  //injecting the service
  constructor(private readonly convService: ConvService) {
    console.log('conv controller started');
  }
  //endpoint to create a new conversation
  @Post()
  create(@Body() createConvDto: CreateConvDto) {
    return this.convService.create(createConvDto);
  }
  //endpoint to get all conversations of a user
  @Post('/ofUser')
  convsOfUser(@Body() conv: any) {
    return this.convService.convOfUser(conv);
  }
  //endpoint to handle typing event
  @Post('/typing')
  typing(@Body() object: any) {
    return this.convService.typing(object);
  }
  //endpoint to make a groupe
  @Post('/groupe')
  makeGroupe(@Body() body: any) {
    return this.convService.makeGroupe(body);
  }
  //endpoint to get all conversations
  @Get()
  findAll() {
    return this.convService.findAll();
  }
  //endpoint to get a conversation by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.convService.findOne(id);
  }
  //endpoint to search in conversations of a user by the key word and the user id(myid)
  @Get('/search/:key/:myid')
  searched(@Param('key') key: string, @Param('myid') myid: string) {
    return this.convService.searched(key, myid);
  }
  //endpoint to get all conversations of a user by his id
  @Get('/myConvs/:myid')
  getMyConvs(@Param('myid') id: string) {
    return this.convService.getMyConvs(id);
  }
  //endpoint to get all members of a conversation by the conversation id , the user id is to found out the operation to perform on the members(add,cancel,accept,remove)
  @Get('/members/:idConv/:myId')
  getMembers(@Param('idConv') idConv: string, @Param('myId') myId: string) {
    return this.convService.getMembers(idConv, myId);
  }
  //endpoint to update a conversation by the conversation id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConvDto: UpdateConvDto) {
    return this.convService.update(id, updateConvDto);
  }
  //endpoint to add members
  @Patch('addMembers/:id')
  addMembers(@Param('id') id: string, @Body() members: string[]) {
    return this.convService.addMembers(id, members);
  }
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
  //endpoint to update a conversation photo by the conversation id
  @Patch('photo/:id')
  updatePhoto(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFileInterface,
  ) {
    return this.convService.updatePhoto(id, file);
  }
  //endpoint to delete a conversation by the conversation id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.convService.remove(id);
  }
  //endpoint to delete all conversations(dev mode)
  @Delete('/all/all')
  removeAll() {
    return this.convService.removeAll();
  }
  //endpoint to leave a conversation by the conversation id and the user id, delete it if the user is the last member
  @Delete('/leave/:myId/:idConv')
  leave(@Param('myId') id: string, @Param('idConv') idConv: string) {
    return this.convService.leaveConv(id, idConv);
  }
  @Delete('/leaveAll/:idUser')
  leaveAll(@Param('idUser') idUser: string) {
    return this.convService.leaveAll(idUser);
  }
  @Delete('/removeFromGroupe/:idUser/:idAdmin/:idConv')
  removeFromGroupe(
    @Param('idUser') idUser: string,
    @Param('idAdmin') idAdmin: string,
    @Param('idConv') idConv: string,
  ) {
    return this.convService.removeFromGroupe(idUser, idAdmin, idConv);
  }
}
