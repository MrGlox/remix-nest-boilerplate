import { Observable } from 'rxjs';

import { EventData } from './event-data.interface';

export interface ISseService {
  emitEvent(id: string, data: EventData): void;
  clearEvent(id: string): void;
  isEventActive(id: string): boolean;
  getObservable(id: string): Observable<EventData>;
}