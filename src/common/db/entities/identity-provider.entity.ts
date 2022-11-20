import { Column, Entity, ObjectID } from 'typeorm';
import { AuthScope } from '../../constants/auth.constant';
import { BaseEntity } from './base.entity';

@Entity({ name: 'identity_providers', synchronize: false })
export class IdentityProvider extends BaseEntity {
  @Column({ enum: AuthScope })
  provider: AuthScope;

  @Column()
  providerId: string | number;

  @Column(() => ObjectID)
  userId: ObjectID;
}
