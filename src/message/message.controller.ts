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
  @Get('/ofConv/:idConv/:limit/:userId')
  findMessageOfConv(
    @Param('idConv') idConv: string,
    @Param('limit') limit: number,
    @Param('userId') userId: string,
  ) {
    return this.messageService.findMessageOfConv(idConv, limit, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): any {
    return this.messageService.remove(id);
  }
  @Delete('deleteForMe/:id/:memberLength')
  deleteForMe(
    @Param('id') id: string,
    @Param('memberLength') memberLength: number,
  ) {
    return this.messageService.deleteForMe(id, memberLength);
  }
  @Delete('/all/all')
  removeAll() {
    return this.messageService.removeAll();
  }
}
