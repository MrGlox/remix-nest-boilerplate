import { Injectable } from "@nestjs/common";
import { Stripe } from "stripe";

import { Subscription } from "@prisma/client";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    // @Inject('STRIPE') private readonly stripe: Stripe,
  ) {}

  public readonly createSubscription = async ({
    stripeCustomerId,
    ...data
  }: Omit<Subscription, "id" | "createdAt" | "updatedAt"> & {
    stripeCustomerId: string | Stripe.Customer | Stripe.DeletedCustomer;
  }): Promise<Subscription> => {
    const user = await this.prisma.user.findUnique({
      where: {
        stripeCustomerId:
          typeof stripeCustomerId === "string"
            ? stripeCustomerId
            : stripeCustomerId.id,
      },
    });

    if (!user) {
      throw new Error(
        `User with stripeCustomerId ${stripeCustomerId} not found`,
      );
    }
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: user.id,
        startDate: new Date(),
        priceId: data.productId || '',
        endDate: new Date(),
        stripeSubscriptionId: '',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
    }});

    return subscription;
  };

  public readonly updateSubscription = async (
    stripeSubscriptionId: string,
    data: Partial<Subscription>,
  ): Promise<Subscription> => {
    return this.prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    });
  };

  public readonly getSubscription = async (
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> => {
    return this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });
  };
}
