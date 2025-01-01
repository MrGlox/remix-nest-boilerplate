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
    public readonly customer: CustomerService,
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

  public readonly listProducts = async (
    limit = 10,
  ): Promise<ProductsWithPrices[]> => {
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
  };

  public readonly retrieveSubscription = async (
    userId: string,
  ): Promise<void> => {
    const customer = await this.customer.retrieveCustomer(userId);
    console.log('customer', customer);

    // const subscriptions = await this.stripe.subscriptions.list({
    //   stripeAccount: customer,
    // });
    // console.log('subscriptions', subscriptions);

    // return subscriptions.data[0];
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
