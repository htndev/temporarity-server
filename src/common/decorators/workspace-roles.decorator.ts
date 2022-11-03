import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/role.constant';

export const WORKSPACE_ROLES_DECORATOR_KEY = Symbol('WORKSPACE_ROLES');

export const WorkspaceRoles = (roles: Role[]) => SetMetadata(WORKSPACE_ROLES_DECORATOR_KEY, roles);
