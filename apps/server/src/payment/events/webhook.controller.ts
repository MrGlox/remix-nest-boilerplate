import {
  Controller,
  Headers,
  Inject,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { Response } from 'express';
import { PaymentService } from '../payment.service';
import { WebhookService } from './webhook.service';

@Controller()
export class WebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly payment: PaymentService,
    private readonly webhook: WebhookService,
    private readonly logger: Logger,
    @Inject('STRIPE') private readonly stripe: Stripe,
  ) {}

  @Post('/webhook')
  async stripeWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const payload = req.rawBody;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload || '',
        signature,
        this.config.get('stripe.webhookSecret') || '',
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed.`, err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    switch (event.type) {
      // case "customer.created":
      //   await this.webhook.handleCustomerCreated(event.data.object as Stripe.Customer);
      //   break;

      case 'product.created':
        await this.webhook.handleProductUpdated(
          event.data.object as Stripe.Product,
        );
        break;

      case 'product.updated':
        await this.webhook.handleProductUpdated(
          event.data.object as Stripe.Product,
        );
        break;

      // more secure ?
      // case "customer.subscription.created":
      //   await this.webhook.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      //   break;

      case 'customer.subscription.paused':
        await this.webhook.handleSubscriptionPaused(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        ); // TODO call service
        break;

      case 'customer.subscription.deleted':
        await this.webhook.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.payment_succeeded':
        await this.webhook.handlePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;

      // case "invoice.upcoming":
      //   // handleUpcomingInvoice(event.data.object);
      //   break;

      // case "invoice.payment_failed":
      //   // handlePaymentFailed(event.data.object);
      //   break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Update subscription schema with the data from Stripe
      await this.payment.updateSubscription(subscription);
      this.logger.log(`Subscription ${subscription.id} updated successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to update subscription ${subscription.id}:`,
        error,
      );
    }
  }
}
