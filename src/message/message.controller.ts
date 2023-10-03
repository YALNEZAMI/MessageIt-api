/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
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
  @Get('MessageSearchedGroup/:idConv/:idMessage')
  getMessageSearchedGroup(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
  ) {
    return this.messageService.getMessageSearchedGroup(idConv, idMessage);
  }
  ///appendDown/${idConv}/${range}
  @Get('appendDown/:idConv/:idMessage')
  appendDown(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
  ) {
    return this.messageService.appendDown(idConv, idMessage);
  }
  @Get('appendUp/:idConv/:idMessage')
  appendUp(
    @Param('idConv') idConv: string,
    @Param('idMessage') idMessage: string,
  ) {
    return this.messageService.appendUp(idConv, idMessage);
  }
  @Get('search/:key')
  getMessagesByKey(@Param('key') key: string) {
    return this.messageService.getMessagesByKey(key);
  }
  @Get('/ofConv/:idConv')
  findMessageOfConv(@Param('idConv') idConv: string) {
    return this.messageService.findMessageOfConv(idConv);
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
  @Delete('/all/all')
  removeAll() {
    return this.messageService.removeAll();
  }
}
