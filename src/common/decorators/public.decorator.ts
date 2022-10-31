import { SetMetadata } from '@nestjs/common';

export const PUBLIC_DECORATOR_KEY = Symbol('isPublic');

export const Public = () => SetMetadata(PUBLIC_DECORATOR_KEY, true);
