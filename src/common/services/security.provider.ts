import { Injectable } from '@nestjs/common';
import { genSalt, hash, compare } from 'bcrypt';

@Injectable()
export class SecurityProvider {
  async encrypt(value: string): Promise<string> {
    const salt = await genSalt(10);

    return hash(value, salt);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return compare(value, hash);
  }
}
