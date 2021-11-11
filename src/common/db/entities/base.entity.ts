import { BaseEntity as BaseTypeormEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity extends BaseTypeormEntity {
  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
