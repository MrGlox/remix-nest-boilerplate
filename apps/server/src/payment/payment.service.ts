import { Inject, Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { CustomerService } from './customer/customer.service';

type ProductsWithPrices = Stripe.Product & {
  prices: Record<string, Stripe.Price[]>;
};

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly customer: CustomerService,
  ) {}

  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  // async listInvoices(userId: string): Promise<Stripe.Invoice[]> {
  //   const customer = await this.customer.retrieveCustomer(userId);

  //   const invoices = await this.stripe.invoices.list({
  //     customer,
  //   });

  //   console.log('invoices', invoices);

  //   // const subscriptions = await this.stripe.subscriptions.list({
  //   //   customer,
  //   // });

  //   return invoices.data;
  // }

  async listProducts(limit = 10): Promise<ProductsWithPrices[]> {
    const products = await this.stripe.products.list({ limit, active: true });
    const prices = await this.stripe.prices.list({
      limit: limit * 3,
      active: true,
    });

    const productsWithPrices = products.data.map((product) => {
      const productPrices = prices.data.filter(
        (price) => price.product === product.id,
      );
      return {
        ...product,
        prices: productPrices.reduce(
          (acc, price) => {
            const interval = price.recurring?.interval || 'one_time';
            if (!acc[interval]) {
              acc[interval] = [];
            }
            acc[interval].push(price);
            return acc;
          },
          {} as Record<string, Stripe.Price[]>,
        ),
      };
    });

    return productsWithPrices;
  }

  async retrieveSubscription(userId: string) {
    // :Promise<Stripe.Subscription | null>
    // const customer = await this.customer.retrieveCustomer(userId);
    // console.log('customer', customer);
    // const subscriptions = await this.stripe.subscriptions.list({
    //   stripeAccount: customer,
    // });
    // console.log('subscriptions', subscriptions);
    // return subscriptions.data[0];
  }

  /**
   * PAYMENT METHODS
   */
  async createPaymentIntent(
    stripeUserId: string,
    amount: number,
    currency = 'eur',
  ): Promise<Stripe.PaymentIntent> {
    console.log('stripeUserId', stripeUserId);

    return this.stripe.paymentIntents.create({
      customer: stripeUserId,
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async updatePaymentIntent(
    id: string,
    params: Stripe.PaymentIntentUpdateParams,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.update(id, params);
  }
}
