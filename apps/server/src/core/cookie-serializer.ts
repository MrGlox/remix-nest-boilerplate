import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class CookieSerializer extends PassportSerializer {
  deserializeUser(payload: any, done: any) {
    // log('deserializeUser', { payload });
    done(null, payload);
  }

  serializeUser(user: any, done: any) {
    // log('serializeUser', { user });
    done(null, user);
  }
}
