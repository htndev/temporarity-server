import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  create(createRouteDto: CreateRouteDto) {
    return 'This action adds a new route';
  }
}
