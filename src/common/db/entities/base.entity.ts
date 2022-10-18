import { BaseEntity as BaseTypeormEntity, CreateDateColumn, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity extends BaseTypeormEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
