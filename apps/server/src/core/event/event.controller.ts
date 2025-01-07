import { Controller, Param, Sse } from "@nestjs/common";
import { Observable, filter, fromEvent, interval, map } from "rxjs";

import { EventEmitter2 } from "@nestjs/event-emitter";

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

/**
 * Server-Sent Events (SSE) controller
 */
@Controller("events")
export class EventController {
  constructor(
    // private readonly event: EventService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse("notifications/:sessionToken/stream")
  notifications(
    @Param("sessionToken") sessionToken: string,
  ): Observable<MessageEvent> {
    // Return an observable that emits notifications for the given user
    return fromEvent(this.eventEmitter, "user.notification").pipe(
      // Filter notifications by user ID
      filter(
        (payload: any) =>
          payload.user.sessions[0].sessionToken === sessionToken,
      ),
      // Map the payload to a MessageEvent
      map(
        (payload) =>
          // Create a new MessageEvent with the notification payload
          new MessageEvent("message", {
            data: JSON.stringify(payload),
          } as MessageEventInit),
      ),
    );
  }

  time(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map((_) => ({ data: { time: new Date().toISOString() } })),
    );
  }
}
