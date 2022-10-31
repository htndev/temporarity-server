import { EmailConfig } from '../config/email.config';
import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private readonly emailConfig: EmailConfig) {
    this.transporter = createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: true,
      auth: {
        user: emailConfig.userEmail,
        pass: emailConfig.userPassword
      },
      from: emailConfig.formattedFrom
    });
  }

  async sendEmail(to: string, subject: string, message: string) {
    await this.transporter.sendMail({ subject, html: message, to, from: this.emailConfig.formattedFrom });
  }

  parseEmailTemplate(template: string, data: any) {
    return template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => data[key]);
  }
}
