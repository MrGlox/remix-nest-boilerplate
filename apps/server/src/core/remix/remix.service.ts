import { Injectable } from '@nestjs/common';

import { AuthService } from '../../auth/auth.service';
import { OfferService } from '../../offer/offer.service';
import { PaymentService } from '../../payment/payment.service';
import { PrismaService } from '../database/prisma.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class RemixService {
  constructor(
    public readonly prisma: PrismaService,
    public readonly auth: AuthService,
    public readonly token: TokenService,
    public readonly payment: PaymentService,
    public readonly offer: OfferService,
  ) {}

  public readonly getUser = async ({ userId }: { userId: string }) => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
      },
    });

    return user;
  };
}
