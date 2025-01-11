import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { Stripe } from 'stripe';

import { PrismaService } from '../../core/database/prisma.service';

import { PaymentService } from '../payment.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly product: ProductService,
    private readonly payment: PaymentService,
  ) {}

  public readonly handleCustomerCreated = async (customer: Stripe.Customer) => {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: customer.email || undefined,
      },
    });

    if (!existingUser) {
      this.logger.error(
        `No user found with email ${customer.email}. Skipping customer creation.`,
      );

      return;
    }

    // if (existingUser.stripeCustomerId) {
    //   this.logger.error(
    //     `User ${existingUser.email} already has a stripeCustomerId. Skipping user udpate.`,
    //   );

    //   return;
    // }

    try {
      const user = await this.prisma.user.update({
        where: {
          email: customer.email || undefined,
        },
        data: {
          stripeCustomerId: customer.id,
        },
      });

      this.logger.log(
        `User udpated (${user.email}) with stripeCustomerId ${customer.id}`,
      );

      return user;
    } catch (error) {
      this.logger.error(`Failed to create customer ${customer.id}: ${error}`);
    }
  };

  public readonly handleProductUpdated = async (product: Stripe.Product) => {
    try {
      const newProduct = await this.product.createProduct({
        id: product.id,
        active: product.active,
        name: product.name,
        productId: product.id,
        description: product.description,
        variantId: product.metadata.variant_id
          ? String(product.metadata.variant_id)
          : null,
        images: product.images,
        features: [],
        sort: product.metadata.sort ? Number(product.metadata.sort) : null,
        metadata: product.metadata,
      });

      this.logger.log(`Product ${product.id} upserted successfully.`);

      return newProduct;
    } catch (error) {
      this.logger.error(`Failed to create product ${product.id}: ${error}`);
    }
  }; // TODO

  public readonly handleSubscriptionCreated = async (
    subscription: Stripe.Subscription,
  ) => {
    try {
      const newSubscription =
        await this.payment.subscription.upsertSubscription({
          productId: String(subscription.items.data[0].plan.product),
          stripeSubscriptionId: subscription.id,
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          startDate: new Date(subscription.start_date * 1000),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
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
          stripeCustomerId: subscription.customer,
          userId: subscription.metadata.userId,
          priceId: subscription.items.data[0].price.id,
        });

      this.logger.log(`Subscription ${subscription.id} created successfully.`);

      return newSubscription;
    } catch (error) {
      this.logger.error(
        `Failed to create subscription ${subscription.id}: ${error}`,
      );
    }
  };

  public readonly handleSubscriptionPaused = async (
    subscription: Stripe.Subscription,
  ) => {
    try {
      await this.payment.subscription.updateSubscription(subscription.id, {
        stripeSubscriptionId: subscription.id,
        status: subscription.status.toUpperCase() as SubscriptionStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      });

      this.logger.log(`Subscription ${subscription.id} paused successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to pause subscription ${subscription.id}: ${error}`,
      );
    }
  };

  public readonly handleSubscriptionDeleted = async (
    subscription: Stripe.Subscription,
  ) => {
    try {
      await this.payment.subscription.updateSubscription(subscription.id, {
        stripeSubscriptionId: subscription.id,
        status: 'CANCELLED',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      });

      this.logger.log(`Subscription ${subscription.id} deleted successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to delete subscription ${subscription.id}: ${error}`,
      );
    }
  };

  /**
   * PAYMENT
   */
  public readonly handlePaymentSucceeded = async (invoice: Stripe.Invoice) => {
    console.log('invoice', invoice);

    try {
      await this.payment.createPayment({
        subscriptionId: invoice.subscription as string,
        invoiceId: invoice.id,
        paymentId: invoice.payment_intent as string,
        amount: invoice.total,
        currency: invoice.currency,
        status: (invoice.status?.toUpperCase() as PaymentStatus) || 'SUCCEEDED',
      });

      this.logger.log(`Payment ${invoice.id} created successfully.`);
    } catch (error) {
      this.logger.error(`Failed to create payment ${invoice.id}: ${error}`);
    }
  };
}
