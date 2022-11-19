import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('user_preferences')
export class UserPreferences extends BaseEntity {
  @ObjectIdColumn()
  userId: ObjectID | string;

  @Column()
  language: string;
}
