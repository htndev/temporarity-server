import { WorkspaceRoutesShortTemplate } from './../../types/workspace.type';
import { Injectable } from '@nestjs/common';
import { WorkspaceRoutesTemplate } from '../entities/workspace-routes-template.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class WorkspaceRoutesTemplateRepository extends BaseRepository<WorkspaceRoutesTemplate> {
  getGeneralTemplates(): Promise<WorkspaceRoutesShortTemplate[]> {
    return this.find().then((templates) =>
      templates.map((template) => ({
        name: template.name,
        keyword: template.keyword,
        description: template.description
      }))
    );
  }
}
