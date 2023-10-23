import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CreateReactionDto {
  @PrimaryGeneratedColumn()
  _id: string;
  @Column()
  type: string;
  @Column()
  user: string;
  @Column()
  message: string;
}
