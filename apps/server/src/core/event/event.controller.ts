import { Controller, Headers, NotFoundException, Sse } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';

import { EventService } from './event.service';

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

/**
 * Server-Sent Events (SSE) controller
 */
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // @Get()
  // sendEvents(@Res() response: Response) {
  //   response.setHeader('Content-Type', 'text/event-stream');
  //   response.setHeader('Cache-Control', 'no-cache');
  //   response.setHeader('Connection', 'keep-alive');

  //   const sendEvent = () => {
  //     response.write(
  //       `data: ${JSON.stringify({ message: new Date().toISOString() })}\n\n`,
  //     );
  //   };

  //   // Send an event every 5 seconds
  //   const interval = setInterval(sendEvent, 1000);

  //   // Clean up when the client closes the connection
  //   response.on('close', () => {
  //     clearInterval(interval);
  //     response.end();
  // }

  // @Sse('notifications/cm5fulfkt0000reo0lrebp4kh')
  // notifications(): Observable<MessageEvent> {
  //   return interval(5000).pipe(map((_) => ({ data: { message: "notification_created" } })));
  // }

  @Sse('notifications')
  notifications(@Headers('authorization') sessionToken: string): Observable<MessageEvent> {
    if (!sessionToken) {
      throw new NotFoundException('Session token not provided');
    }

    return this.eventService.getObservable(sessionToken).pipe(
      map((data) => ({ data }))
    );
  }

  @Sse('time')
  time(): Observable<MessageEvent> {
    return interval(1000).pipe(map((_) => ({ data: { time: new Date().toISOString() } })));
  }
}
