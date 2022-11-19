import { FindOneOptions, Repository } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export class BaseRepository<T extends BaseEntity> extends Repository<T> {
  async isExists(entity: Partial<T>) {
    try {
      await this.findOneOrFail(entity as FindOneOptions<T>);
      return true;
    } catch (e) {
      return false;
    }
  }

  async retrieveId(entity: Partial<T>) {
    const result = await this.findOne(entity as FindOneOptions<T>);
    console.log(result);
    console.log(result.id);
    // @ts-ignore
    console.log(result._id);
    return result ? result.id : null;
  }
}
