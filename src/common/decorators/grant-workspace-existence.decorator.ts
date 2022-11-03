import { UseGuards } from '@nestjs/common';
import { GrantWorkspaceGuard } from '../guards/grant-workspace.guard';

export const GrantWorkspaceExistence = () => UseGuards(GrantWorkspaceGuard);
