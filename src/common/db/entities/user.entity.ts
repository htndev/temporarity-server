import { compare, hash } from 'bcrypt';
import { BeforeInsert, Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { SALT_ROUNDS } from '../../constants/security.constant';
import { Nullable } from './../../types/base.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'users', synchronize: false })
export class User extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ type: 'string' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: Nullable<string>;

  @Column({
    nullable: true,
    default: null
  })
  profilePicture: Nullable<string>;

  @Column({ type: Boolean, default: false })
  isOauthUser: boolean;

  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    if (!this.password) {
      return;
    }
    this.password = await hash(this.password, SALT_ROUNDS);
  }

  async comparePassword(password): Promise<boolean> {
    return compare(password, this.password);
  }
}
