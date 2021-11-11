import { AuthScope } from './../../constants/auth.constant';
import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

import { BaseConfig } from './base.config';

interface SecurityConfigProperties {
  FACEBOOK_APP_ID: number;
  FACEBOOK_APP_SECRET: string;
  GOOGLE_APP_ID: string;
  GOOGLE_APP_SECRET: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_SECRET: string;
}

type AuthProps = { [k in AuthScope]: string | number };

@Injectable()
export class SecurityConfig extends BaseConfig<SecurityConfigProperties> {
  getSchema(): Joi.ObjectSchema<SecurityConfigProperties> {
    return Joi.object({
      FACEBOOK_APP_ID: Joi.number().required(),
      FACEBOOK_APP_SECRET: Joi.string().required(),
      GOOGLE_APP_ID: Joi.string().required(),
      GOOGLE_APP_SECRET: Joi.string().required(),
      GITHUB_APP_ID: Joi.string().required(),
      GITHUB_APP_SECRET: Joi.string().required()
    });
  }

  get appId(): AuthProps {
    return {
      [AuthScope.Facebook]: this.config.FACEBOOK_APP_ID,
      [AuthScope.Google]: this.config.GOOGLE_APP_ID,
      [AuthScope.Github]: this.config.GITHUB_APP_ID
    };
  }

  get secret(): AuthProps {
    return {
      [AuthScope.Facebook]: this.config.FACEBOOK_APP_SECRET,
      [AuthScope.Google]: this.config.GOOGLE_APP_SECRET,
      [AuthScope.Github]: this.config.GITHUB_APP_SECRET
    };
  }
}
