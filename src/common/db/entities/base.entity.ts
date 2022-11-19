import { BaseEntity as BaseTypeormEntity, CreateDateColumn, ObjectID, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity extends BaseTypeormEntity {
  @ObjectIdColumn({ name: '_id', primary: true })
  _id: ObjectID | string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
