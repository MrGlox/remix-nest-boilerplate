import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment, Price, Product, SubscriptionStatus } from '@prisma/client';

import Stripe from 'stripe';

import { PrismaService } from '../core/database/prisma.service';

import { CustomerService } from './customer/customer.service';
import { SubscriptionService } from './subscription/subscription.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    @Inject('STRIPE') private readonly stripe: Stripe,
    public readonly customer: CustomerService,
    public readonly subscription: SubscriptionService,
    private readonly config: ConfigService,
  ) {}

  /**
   * INVOICES
   */
  public readonly listInvoices = async (userId: string): Promise<void> => {
    const customer = await this.customer.retrieveCustomer(userId);

    console.log('customer', customer);

    // const invoices = await this.stripe.invoices.list({
    //   customer,
    // });
    // console.log('invoices', invoices);
    // const subscriptions = await this.stripe.subscriptions.list({
    //   customer,
    // });
    // return invoices.data;
  };

  /**
   * PRODUCTS
   */
  public readonly listProducts = async (): Promise<
    (Product & { prices: Price[] })[]
  > => {
    return await this.prisma.product.findMany({
      include: {
        prices: true,
      },
    });
  };

  /**
   * SUBSCRIPTIONS
   */
  public readonly retrieveSubscription = async (userId: string) => {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        price: true,
        product: true,
      },
    });

    if (!subscription) {
      this.logger.warn(`No active subscription found for user ${userId}`);
      return null;
    }

    return subscription;
  };

  public readonly hasActiveSubscription = async (userId: string) => {
    const subscription = await this.retrieveSubscription(userId);
    return subscription !== null;
  };

  public readonly updateSubscription = async (
    subscription: Stripe.Subscription,
  ): Promise<void> => {
    try {
      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });
      this.logger.log(`Subscription ${subscription.id} updated successfully.`);
    } catch (error) {
      this.logger.warn(
        `Failed to update subscription ${subscription.id}:`,
        error,
      );
    }
  };

  public readonly createSubscription = async (
    paymentIntentId: string,
    userId: string,
  ): Promise<Stripe.Subscription | null> => {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    const priceId = paymentIntent.metadata?.price_id;
    const customerId = paymentIntent.customer;
    const paymentMethodId = paymentIntent.payment_method;

    if (!paymentIntent.customer || !priceId || !paymentMethodId) {
      this.logger.warn(
        `Missing required data for subscription: customer=${customerId}, priceId=${priceId}, paymentMethodId=${paymentMethodId}`,
      );
      return null;
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId as string,
      items: [
        {
          price: priceId,
        },
      ],
      default_payment_method: paymentMethodId as string,
    });

    const price = await this.prisma.price.findUnique({
      where: { priceId },
      include: { product: true },
    });

    if (!price) {
      this.logger.error(`Price ${priceId} not found`);
      return null;
    }

    await this.subscription.upsertSubscription({
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId as string,
      productId: price.product.id,
      priceId: price.priceId,
      status: subscription.status.toUpperCase() as SubscriptionStatus,
      startDate: new Date(subscription.start_date * 1000),
      endedAt: null,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    });

    return subscription;
  };

  /**
   * PAYMENT METHODS
   */
  public readonly createPaymentIntent = async (
    stripeCustomerId: string,
    params: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent> => {
    return await this.stripe.paymentIntents.create({
      ...params,
      customer: stripeCustomerId,
      setup_future_usage: 'off_session',
      automatic_payment_methods: {
        enabled: true,
      },
    });
  };

  public readonly updatePaymentIntent = async (
    id: string,
    params: Stripe.PaymentIntentUpdateParams,
  ): Promise<Stripe.PaymentIntent> => {
    return await this.stripe.paymentIntents.update(id, params);
  };

  /**
   * PAYMENTS
   */
  public readonly createPayment = async (
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    return await this.prisma.payment.create({
      data,
    });
  };
}
