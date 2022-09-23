import { HttpStatus } from '@nestjs/common';

export type HttpResponse<T extends Record<string, any> = any> = { status: HttpStatus; message?: string } & T;
