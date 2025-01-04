import { Injectable, NotFoundException } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';

import { PrismaService } from '../database/prisma.service';
import { TokenService } from '../token/token.service';

import { EventData } from './interfaces/event-data.interface';

@Injectable()
export class EventService {
  constructor(
    public readonly prisma: PrismaService,
    public readonly token: TokenService,
  ) {}

  private eventSubjects: Map<string, Subject<EventData>> = new Map();

  sendEvent(id: string, data: any) {
    let eventSubject = this.eventSubjects.get(id);

    if (!eventSubject) {
      eventSubject = new Subject<EventData>();
      this.eventSubjects.set(id, eventSubject);
    }

    eventSubject.next(data);
  }

  clearEvent(id: string) {
    const eventSubject = this.eventSubjects.get(id);

    if (eventSubject) {
      eventSubject.complete();
      this.eventSubjects.delete(id);
    }
  }

  isEventActive(id: string) {
    const eventSubject = this.eventSubjects.get(id);

    if (eventSubject) {
      return true;
    }
  }

  getObservable(eventId: string): Observable<EventData> {
    const eventSubject = this.eventSubjects.get(eventId);

    if (!eventSubject) {
      throw new NotFoundException(`Event stream with ID ${eventId} not found`);
    }

    return eventSubject.asObservable().pipe(map((data) => data));
  }
}
