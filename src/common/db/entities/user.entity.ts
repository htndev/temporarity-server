import { compare, hash } from 'bcrypt';
import { BeforeInsert, Column, Entity, Index } from 'typeorm';
import { SALT_ROUNDS } from '../../constants/security.constant';
import { Nullable } from './../../types/base.type';
import { BaseEntity } from './base.entity';

@Entity({ name: 'users', synchronize: true })
export class User extends BaseEntity {
  @Column({ type: 'string' })
  fullName: string;

  @Column({ unique: true })
  @Index()
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
