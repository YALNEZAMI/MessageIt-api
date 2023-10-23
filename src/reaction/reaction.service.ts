import { Injectable } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { Model } from 'mongoose';
import { Reaction, ReactionDocument } from './entities/reaction.entity';
import { InjectModel } from '@nestjs/mongoose';
import { WebSocketsService } from 'src/web-sockets/web-sockets.service';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name)
    private reactionModel: Model<ReactionDocument>,
    private webSocketService: WebSocketsService,
  ) {}
  alreadyReacted(messageId: string, userId: string) {
    return this.reactionModel
      .findOne({ message: messageId, user: userId })
      .exec();
  }
  async create(createReactionDto: CreateReactionDto): Promise<any> {
    //set websocket of reaction
    this.webSocketService.reaction(createReactionDto);
    const check: any = await this.alreadyReacted(
      createReactionDto.message,
      createReactionDto.user,
    );
    if (check != null) {
      if (createReactionDto.type == check.type) {
        return this.reactionModel
          .deleteOne({
            message: createReactionDto.message,
            user: createReactionDto.user,
          })
          .exec();
      } else {
        return this.reactionModel
          .updateOne(
            {
              message: createReactionDto.message,
              user: createReactionDto.user,
            },
            createReactionDto,
          )
          .exec();
      }
    }
    return this.reactionModel.create(createReactionDto);
  }

  async findAll() {
    const reactions = await this.reactionModel.find().exec();

    return reactions;
  }
  async findAllOfMessage(idMessage: string) {
    const reactions = await this.reactionModel
      .find({ message: idMessage })
      .exec();

    return reactions;
  }

  async findOne(id: string) {
    const reaction = await this.reactionModel.findById(id).exec();
    return reaction;
  }

  update(id: string, updateReactionDto: UpdateReactionDto) {
    return this.reactionModel.updateOne({ _id: id }, updateReactionDto).exec();
  }

  remove(id: string): any {
    return this.reactionModel.deleteOne({ _id: id }).exec();
  }
  removeAllOfMsg(id: string): any {
    return this.reactionModel.deleteMany({ message: id }).exec();
  }
}