import { Injectable, Logger } from "@nestjs/common";
import { Product, SubscriptionStatus } from "@prisma/client";
import { Stripe } from "stripe";

import { PrismaService } from "../../core/database/prisma.service";

import { PaymentService } from "../payment.service";
import { ProductService } from "../product/product.service";

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
    //     `User ${existingUser.email} already has a stripeCustomerId. Skipping customer creation.`,
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

  public readonly handleProductCreated = async (product: Stripe.Product) => {
    try {
      const newProduct = await this.product.createProduct({
        productId: product.id,
        name: product.name,
        description: product.description,
        variantId: String(product.metadata.variant_id),
        price: product.metadata.amount,
        currency: product.metadata.currency,
        interval: product.metadata.interval,
        intervalCount: product.metadata.interval_count,
        sort: Number(product.metadata.sort),
        trialPeriodDays: Number(product.metadata.trial_period_days),
        trialInterval: product.metadata.trial_interval,
        trialIntervalCount: Number(product.metadata.trial_interval_count),
      } as unknown as Product);

      this.logger.log(`Product ${product.id} created successfully.`);

      return newProduct;
    } catch (error) {
      this.logger.error(`Failed to create product ${product.id}: ${error}`);
    }
  } // TODO

  public readonly handleSubscriptionCreated = async (
    subscription: Stripe.Subscription,
  ) => {
    try {
      const newSubscription =
        await this.payment.subscription.createSubscription({
          productId: subscription.items.data[0].plan.id,
          stripeSubscriptionId: subscription.id,
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          startDate: new Date(subscription.start_date * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
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
    // TODO
  };

  public readonly handleSubscriptionDeleted = async (
    subscription: Stripe.Subscription,
  ) => {
    // TODO
  };
}
