import { Injectable } from '@nestjs/common';
import type { Clock } from '../../domain/port/driven/clock';

@Injectable()
export class SystemClock implements Clock {
  agora(): Date {
    return new Date();
  }
}
