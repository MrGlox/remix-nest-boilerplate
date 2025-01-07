import { Inject, Injectable, Logger } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { ConfigService } from "@nestjs/config";

import Stripe from 'stripe';

import { PrismaService } from "../core/database/prisma.service";

import { CustomerService } from './customer/customer.service';
import { SubscriptionService } from './subscription/subscription.service';

type ProductsWithPrices = Stripe.Product & {
  prices: Record<string, Stripe.Price[]>;
};

interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
  features: string[];
}

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

  public readonly listPaymentMethods = async (
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> => {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  };

  public readonly listInvoices = async (userId: string): Promise<void> => {
    const customer = await this.customer.retrieveCustomer(userId);

    // console.log('customer', customer);

    // const invoices = await this.stripe.invoices.list({
    //   customer,
    // });
    // console.log('invoices', invoices);
    // const subscriptions = await this.stripe.subscriptions.list({
    //   customer,
    // });
    // return invoices.data;
  };

  public readonly listProducts = async (
    limit = 10,
  ): Promise<ProductWithPrices[]> => {
    // Fetch products with expanded prices
    const products = await this.stripe.products.list({
      limit,
      active: true,
      expand: ["data.default_price"],
    });

    // Fetch all prices separately to ensure we get all of them
    const prices = await this.stripe.prices.list({
      limit: limit * 3,
      active: true,
    });

    // Map products with their prices and extract features
    const productsWithPrices = products.data.map((product) => {
      const productPrices = prices.data.filter(
        (price) => price.product === product.id
      );

      // Extract features from metadata or description
      const features = this.extractProductFeatures(product);

      return {
        ...product,
        prices: productPrices,
        features,
      };
    });

    return productsWithPrices;
  };

  private extractProductFeatures(product: Stripe.Product): string[] {
    // Try to get features from metadata first
    if (product.metadata?.features) {
      try {
        const parsedFeatures = JSON.parse(product.metadata.features);
        if (Array.isArray(parsedFeatures)) {
          return parsedFeatures;
        }
      } catch (e) {
        // If JSON parsing fails, try splitting by delimiter
        return product.metadata.features.split('|').map(f => f.trim());
      }
    }

    // If no features in metadata, try to parse from description
    if (product.description) {
      // Look for bullet points or numbered lists in description
      const bulletPoints = product.description
        .split(/[\n•-]/) // Split by newline, bullet point, or dash
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (bulletPoints.length > 0) {
        return bulletPoints;
      }
    }

    return []; // Return empty array if no features found
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

  public readonly retrieveSubscription = async (
    userId: string,
  ): Promise<Stripe.Subscription | null> => {
    const customer = await this.customer.retrieveCustomer(userId);
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId: customer.id },
    });

    if (!subscription) {
      this.logger.warn(`No subscription found for user ${userId}`);
      return null;
    }

    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      return stripeSubscription;
    } catch (error) {
      console.error(`Failed to retrieve subscription for user ${userId}:`, error);
      return null;
    }
  };

  public readonly getSubscription = async (subscriptionId: string) => {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        console.log(`No subscription found with ID ${subscriptionId}`);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error(`Failed to retrieve subscription with ID ${subscriptionId}:`, error);
      return null;
    }
  };

  /**
   * PAYMENT METHODS
   */
  public readonly createPaymentIntent = (
    stripeUserId: string,
    amount: number,
    currency = 'eur',
  ): Promise<Stripe.PaymentIntent> => {
    console.log('stripeUserId', stripeUserId);

    return this.stripe.paymentIntents.create({
      customer: stripeUserId,
      amount,
      currency,
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
}
