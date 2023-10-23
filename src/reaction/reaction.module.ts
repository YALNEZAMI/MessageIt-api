import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, reactionSchema } from './entities/reaction.entity';
import { WebSocketsModule } from 'src/web-sockets/web-sockets.module';
@Module({
  controllers: [ReactionController],
  providers: [ReactionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Reaction.name,
        schema: reactionSchema,
      },
    ]),
    WebSocketsModule,
  ],
  exports: [ReactionService],
})
export class ReactionModule {}
