import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { AuthService } from '../auth.service';

@Controller('auth')
export class GoogleController {
  constructor(private readonly auth: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {} // @Req() req: Request

  @Get('google/callback')
  @Redirect('/signin')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    if (!req.user) {
      return { message: 'No user from google', error: true };
    }

    const { sessionToken } = await this.auth.authenticateUser({
      // @ts-ignore
      email: req.user.email,
    });

    return { url: `/authenticate?token=${sessionToken}&redirectTo=/dashboard` };
  }
}
