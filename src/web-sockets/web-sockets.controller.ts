/* eslint-disable prettier/prettier */
import {
  Controller,
  // Param,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from '@nestjs/common';
import { WebSocketsService } from './web-sockets.service';
// import { CreateWebSocketDto } from './dto/create-web-socket.dto';
// import { UpdateWebSocketDto } from './dto/update-web-socket.dto';

@Controller('web-sockets')
export class WebSocketsController {
  constructor(private readonly webSocketsService: WebSocketsService) {}

  // @Post()
  // create(@Body() createWebSocketDto: CreateWebSocketDto) {
  //   return this.webSocketsService.create(createWebSocketDto);
  // }

  // @Get()
  // findAll() {
  //   return this.webSocketsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.webSocketsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWebSocketDto: UpdateWebSocketDto) {
  //   return this.webSocketsService.update(+id, updateWebSocketDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.webSocketsService.remove(+id);
  // }
}
