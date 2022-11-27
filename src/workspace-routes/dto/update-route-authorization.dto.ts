import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestValidationStrategy } from '../../common/constants/routes.constant';
import { ApiKeyConfig, JwtStrategyConfig } from '../../common/types/workspace-route-authorization-strategy.type';

export class UpdateRouteAuthorizationDto {
  @IsNotEmpty()
  @IsEnum(RequestValidationStrategy)
  strategy: RequestValidationStrategy;

  payload: JwtStrategyConfig | ApiKeyConfig;
}
