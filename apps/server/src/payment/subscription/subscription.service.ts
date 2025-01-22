import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { Subscription } from '@repo/database';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  public readonly upsertSubscription = async ({
    stripeCustomerId,
    ...data
  }: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> & {
    stripeCustomerId: string | Stripe.Customer | Stripe.DeletedCustomer;
  }): Promise<Subscription> => {
    const user = await this.prisma.user.findUnique({
      where: {
        stripeCustomerId:
          typeof stripeCustomerId === 'string'
            ? stripeCustomerId
            : stripeCustomerId.id,
      },
    });

    if (!user) {
      throw new Error(
        `User with stripeCustomerId ${stripeCustomerId} not found`,
      );
    }

    // First verify the price exists
    const price = await this.prisma.price.findUnique({
      where: { priceId: data.priceId },
    });

    if (!price) {
      throw new Error(`Price with ID ${data.priceId} not found`);
    }

    const subscriptionData = {
      userId: user.id,
      priceId: data.priceId,
      status: data.status,
      startDate: data.startDate,
      endedAt: data.endedAt,
      stripeSubscriptionId: data.stripeSubscriptionId,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      canceledAt: data.canceledAt,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
      productId: data.productId,
    };

    const subscription = await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: data.stripeSubscriptionId },
      update: {
        ...subscriptionData,
      },
      create: {
        ...subscriptionData,
      },
    });

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
