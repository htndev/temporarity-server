import { HttpStatus } from '@nestjs/common';

export type HttpResponse = { status: HttpStatus; message?: string };
