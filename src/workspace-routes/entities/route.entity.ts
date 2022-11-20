import { ObjectID } from 'typeorm';
import { HttpMethod } from '../../common/types/workspace-route.type';

export class Route {
  constructor(public id: ObjectID, public path: string, public methods: HttpMethod[], public status: number) {}
}
