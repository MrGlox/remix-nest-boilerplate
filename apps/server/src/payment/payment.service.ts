import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { Price, Product, SubscriptionStatus } from '@prisma/client';

import Stripe from 'stripe';

import { PrismaService } from "../core/database/prisma.service";

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
  ) { }

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

  public readonly listProducts = async (): Promise<(Product & { prices: Price[] })[]> => {
    return await this.prisma.product.findMany({
      include: {
        prices: true,
      }
    });
  }

  public readonly updateSubscription = async (subscription: Stripe.Subscription): Promise<void> => {
    try {
      await this.prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        },
      });
      console.log(`Subscription ${subscription.id} updated successfully.`);
    } catch (error) {
      console.error(`Failed to update subscription ${subscription.id}:`, error);
    }
  }

  public readonly createSubscription = async (
    paymentIntentId: string,
  ): Promise<Stripe.Subscription | null> => {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    const priceId = paymentIntent.metadata?.price_id;
    const customerId = paymentIntent.customer;
    const paymentMethodId = paymentIntent.payment_method;

    console.log("paymentIntent", paymentIntent.customer, paymentIntent.metadata)

    if (!paymentIntent.customer || !priceId || !paymentMethodId) {
      this.logger.warn(`Missing required data for subscription: customer=${customerId}, priceId=${priceId}, paymentMethodId=${paymentMethodId}`);
      return null;
    }

    // Attach the payment method to the customer
    // await this.stripe.paymentMethods.attach(paymentMethodId as string, {
    //   customer: customerId as string
    // });

    // Set it as the default payment method
    // await this.stripe.customers.update(customerId as string, {
    //   invoice_settings: {
    //     default_payment_method: paymentMethodId as string,
    //   },
    // });

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId as string,
      items: [{
        price: priceId,
      }],
      default_payment_method: paymentMethodId as string,
    });

    return subscription;
  };

  // public readonly getSubscription = async (subscriptionId: string) => {
  //   try {
  //     const subscription = await this.prisma.subscription.findUnique({
  //       where: { id: subscriptionId },
  //     });

  //     if (!subscription) {
  //       console.log(`No subscription found with ID ${subscriptionId}`);
  //       return null;
  //     }

  //     return subscription;
  //   } catch (error) {
  //     console.error(`Failed to retrieve subscription with ID ${subscriptionId}:`, error);
  //     return null;
  //   }
  // };

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


  // public readonly createStripeSubscription = (
  //   stripeCustomerId: string,
  //   priceId: string,
  // ): Promise<Stripe.Subscription> => {
  //   return this.stripe.subscriptions.create({
  //     customer: stripeCustomerId,
  //     items: [
  //       {
  //         price: priceId,
  //       }
  //     ],
  //     payment_settings: {
  //       payment_method_types: ['card'],
  //     },
  //     payment_behavior: 'allow_incomplete',
  //   });
  // };

  // public readonly updateStripeSubscription = async (
  //   id: string,
  //   params: Stripe.SubscriptionUpdateParams,
  // ): Promise<Stripe.Subscription> => {
  //   return await this.stripe.subscriptions.update(id, params);
  // };
}
