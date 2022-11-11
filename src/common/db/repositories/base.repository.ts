import { ObjectID } from 'mongodb';
import { FindOneOptions, Repository } from 'typeorm';
import { BaseEntity } from './../entities/base.entity';

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

  async findOneById(id: ObjectID): Promise<T> {
    return this.findOne(id);
  }
}
