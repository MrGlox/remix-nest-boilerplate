import { All, Controller, Next, Req, Res } from '@nestjs/common';
import { createRequestHandler } from '@react-router/express';
import { getServerBuild } from '@repo/web';
import { NextFunction, Request, Response } from 'express';

import { RemixService } from './remix.service';

@Controller()
export class RemixController {
  constructor(private remixService: RemixService) {}

  @All('*')
  async handler(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ) {
    return createRequestHandler({
      build: await getServerBuild(),
      getLoadContext: () => ({
        user: request.user,
        remixService: this.remixService,
      }),
    })(request, response, next);
  }
}
