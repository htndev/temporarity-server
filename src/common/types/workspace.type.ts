import { RouteTemplate } from './workspace-route.type';
import { Workspace } from '../db/entities/workspace.entity';
import { Role } from '../constants/role.constant';
import { SafeUser } from './auth.type';
import { PossibleContent, Boxed } from './base.type';

export type InnerSchema = Record<string, PossibleContent>;

export type Schema = Boxed<Record<string, Boxed<InnerSchema>>>;

export interface WorkspaceMember extends SafeUser {
  role: Role;
}

export interface WorkspaceWithDetails extends Pick<Workspace, 'apiKey' | 'name' | 'slug' | 'description'> {
  membership: WorkspaceMember[];
}

export interface WorkspaceTemplate {
  name: string;

  description: string;

  routes: RouteTemplate[];
}

export interface WorkspaceRoutesShortTemplate {
  name: string;
  keyword: string;
  description: string;
}
