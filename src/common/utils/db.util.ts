import { Provider, Type } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { BaseEntity } from './../db/entities/base.entity';
import { BaseRepository } from './../db/repositories/base.repository';

export function provideCustomRepository<Entity extends BaseEntity, Repo extends BaseRepository<Entity>>(
  entity: Type<Entity>,
  repository: Type<Repo>,
  dataSource?: DataSource | DataSourceOptions | string
): Provider<Repo> {
  return {
    provide: repository,
    inject: [getDataSourceToken(dataSource)],
    useFactory(dataSource: DataSource) {
      const baseRepository = dataSource.getRepository(entity);

      return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }
  };
}
