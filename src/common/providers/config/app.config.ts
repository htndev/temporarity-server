import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

import { BaseConfig } from './base.config';

interface AppConfigProperties {
  PORT: number;
  ALLOWED_HEADERS: string;
  ALLOWED_DOMAINS: string;
  API_VERSION: string;
  APP_HOSTNAME: string;
  CLIENT_URL: string;
}

@Injectable()
export class AppConfig extends BaseConfig<AppConfigProperties> {
  getSchema(): Joi.ObjectSchema<AppConfigProperties> {
    return Joi.object({
      PORT: Joi.number().required(),
      ALLOWED_HEADERS: Joi.string().default('*'),
      ALLOWED_DOMAINS: Joi.string().default('*'),
      CLIENT_URL: Joi.string().required(),
      APP_HOSTNAME: Joi.string().required(),
      API_VERSION: Joi.string().required()
    });
  }

  get port(): number {
    return this.config.PORT;
  }

  get allowedHeaders(): string[] {
    return this.config.ALLOWED_HEADERS.split(',');
  }

  get allowedDomains(): string[] {
    return this.config.ALLOWED_DOMAINS.split(',');
  }

  get appHostname(): string {
    return this.config.APP_HOSTNAME;
  }

  get clientUrl(): string {
    return this.config.CLIENT_URL;
  }

  get apiVersion(): string {
    return this.config.API_VERSION;
  }

  get isLocalhost(): boolean {
    return this.appHostname.includes('localhost');
  }

  get url(): string {
    const port = this.isLocalhost ? `:${this.port}` : '';

    return `http${this.isLocalhost ? '' : 's'}://${this.appHostname}${port}/${this.apiVersion}`;
  }
}
