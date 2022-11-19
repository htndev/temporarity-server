import { Role } from '../../common/constants/role.constant';
import { Nullable } from '../../common/types/base.type';

export class Workspace {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public slug: string,
    public membership: { email: string; fullName: string; profilePicture: Nullable<string>; role: Role }[]
  ) {}
}
