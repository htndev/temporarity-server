import { BaseEntity } from './../entities/base.entity';
import { ObjectID } from 'mongodb';
import { FindOneOptions, Repository } from 'typeorm';

export class BaseRepository<T extends BaseEntity> extends Repository<T> {
  async isExists(entity: Partial<T>) {
    try {
      await this.findOneOrFail(entity as FindOneOptions<T>);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getId(entity: Partial<T>): Promise<ObjectID> {
    const object = await this.findOne(entity as FindOneOptions<T>);

    return object.id;
  }
}
