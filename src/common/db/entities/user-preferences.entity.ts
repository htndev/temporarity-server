import { Column, Entity, ObjectID } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('user_preferences')
export class UserPreferences extends BaseEntity {
  @Column({ type: 'string' })
  private userId: ObjectID;

  @Column()
  language: string;
}
