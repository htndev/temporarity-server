import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(Workspace)
export class WorkspaceRepository extends BaseRepository<Workspace> {
  async getShortInformation(id: string): Promise<Pick<Workspace, 'id' | 'name' | 'slug' | 'description'>> {
    const workspace = await this.findOne(id);

    return {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      description: workspace.description
    };
  }
}
