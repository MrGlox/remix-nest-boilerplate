import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('events')
export class EventsController {
  @Get()
  sendEvents(@Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const sendEvent = () => {
      response.write(
        `data: ${JSON.stringify({ message: 'Hello from NestJS' })}\n\n`,
      );
    };

    // Send an event every 5 seconds
    const interval = setInterval(sendEvent, 5000);

    // Clean up when the client closes the connection
    response.on('close', () => {
      clearInterval(interval);
      response.end();
    });
  }
}
