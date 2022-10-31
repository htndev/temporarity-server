import * as Joi from 'joi';
import { BaseConfig } from './base.config';

interface IEmailConfig {
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
}

export class EmailConfig extends BaseConfig<IEmailConfig> {
  getSchema(): Joi.ObjectSchema<IEmailConfig> {
    return Joi.object({
      EMAIL_HOST: Joi.string().required(),
      EMAIL_PORT: Joi.string().required(),
      EMAIL_USER: Joi.string().required(),
      EMAIL_PASSWORD: Joi.string().required(),
      EMAIL_FROM: Joi.string().required()
    });
  }

  get host(): string {
    return this.config.EMAIL_HOST;
  }

  get port(): number {
    return this.config.EMAIL_PORT;
  }

  get userEmail(): string {
    return this.config.EMAIL_USER;
  }

  get userPassword(): string {
    return this.config.EMAIL_PASSWORD;
  }

  get from(): string {
    return this.config.EMAIL_FROM;
  }

  get formattedFrom(): string {
    return `"${this.from}" <${this.userEmail}>`;
  }
}
