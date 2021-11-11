import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { AuthScope } from './../../constants/auth.constant';
import { BaseEntity } from './base.entity';

@Entity({ name: 'identity_providers' })
export class IdentityProvider extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ enum: AuthScope })
  provider: AuthScope;

  @Column()
  providerId: string | number;

  @ObjectIdColumn()
  userId: ObjectID;
}
