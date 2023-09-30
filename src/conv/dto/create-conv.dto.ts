import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
//shape of the data that we want to send to the database
@Entity()
export class CreateConvDto {
  //id is automatically generated
  @PrimaryGeneratedColumn()
  _id: string;
  //photo of the conversation
  @Column()
  photo: string;
  //name of the conversation
  @Column()
  name: string;
  //description of the conversation if exist
  @Column()
  description: string;
  //status of the conversation if exist
  @Column()
  status: string;
  //members of the conversation(string to set and array to get)
  @Column()
  members: any[];
}
