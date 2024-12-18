import { Inject, Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { CustomerService } from './customer/customer.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly customer: CustomerService,
  ) {}

  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(id);
  }

  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  async listInvoices(userId: string): Promise<Stripe.Invoice[]> {
    const customer = await this.customer.retrieveCustomer(userId);

    const invoices = await this.stripe.invoices.list({
      customer,
    });

    console.log('invoices', invoices);

    // const subscriptions = await this.stripe.subscriptions.list({
    //   customer,
    // });

    return invoices.data;
  }

  async listProducts(limit = 10): Promise<Stripe.Product[]> {
    const products = await this.stripe.products.list({ limit });

    console.log('products', products);

    return products.data;
  }
}
