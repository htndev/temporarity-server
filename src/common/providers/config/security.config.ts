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
  JWT_SUBJECT: string;
  COOKIE_SECRET: string;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: number;
  JWT_REFRESH_TOKEN_EXPIRES_IN: number;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_BUCKET_FOLDER: string;
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
      GITHUB_APP_SECRET: Joi.string().required(),
      JWT_SUBJECT: Joi.string().required(),
      COOKIE_SECRET: Joi.string().required(),
      JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
      JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
      JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.number().required(),
      JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.number().required(),
      S3_ACCESS_KEY_ID: Joi.string().required(),
      S3_SECRET_ACCESS_KEY: Joi.string().required(),
      S3_BUCKET_NAME: Joi.string().required(),
      S3_BUCKET_FOLDER: Joi.string().required()
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

  get jwtAccessTokenSecret(): string {
    return this.config.JWT_ACCESS_TOKEN_SECRET;
  }

  get jwtRefreshTokenSecret(): string {
    return this.config.JWT_REFRESH_TOKEN_SECRET;
  }

  get cookieSecret(): string {
    return this.config.COOKIE_SECRET;
  }

  get jwtAccessTokenExpiresIn(): number {
    return this.config.JWT_ACCESS_TOKEN_EXPIRES_IN;
  }

  get jwtRefreshTokenExpiresIn(): number {
    return this.config.JWT_REFRESH_TOKEN_EXPIRES_IN;
  }

  get s3AccessKeyId(): string {
    return this.config.S3_ACCESS_KEY_ID;
  }

  get s3AccessSecretKey(): string {
    return this.config.S3_SECRET_ACCESS_KEY;
  }

  get s3BucketFolder(): string {
    return this.config.S3_BUCKET_FOLDER;
  }

  get s3BucketName(): string {
    return this.config.S3_BUCKET_NAME;
  }
}
