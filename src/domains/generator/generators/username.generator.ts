import { generator } from '../utils/data-generator';
import { BaseGenerator } from './base.generator';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const NICKNAMES = readFileSync(resolve(__dirname, '../data/usernames.txt'), 'utf8').split('\n');

export class UsernameGenerator implements BaseGenerator {
  execute(): string {
    return generator.pickone(NICKNAMES);
  }
}
