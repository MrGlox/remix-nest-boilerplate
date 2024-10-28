import {
  Controller,
  Get,
  Next,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { LocalAuthGuard } from './local/local.guard';

@Controller()
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Get('/authenticate')
  @Redirect('/')
  login(@Query('redirectTo') redirectTo: string) {
    return {
      url: redirectTo,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Get('/auth/confirm-email')
  @Redirect('/signin')
  confirmEmail(@Query('redirectTo') redirectTo: string) {
    return {
      url: redirectTo,
    };
  }

  @Post('auth/logout')
  async logout(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ) {
    // this will ensure that re-using the old session id
    // does not have a logged in user
    request.logOut((err) => {
      if (err) {
        return next(err);
      }

      // Ensure the session is destroyed and the user is redirected.
      request.session.destroy(() => {
        response.clearCookie('connect.sid'); // The name of the cookie where express/connect stores its session_id
        response.redirect('/'); // Redirect to website after logout
      });
    });
  }
}
