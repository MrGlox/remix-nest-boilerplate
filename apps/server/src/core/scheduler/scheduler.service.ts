import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { PaymentService } from "src/payment/payment.service";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly payment: PaymentService,
  ) {}

  async onModuleInit() {
    this.logger.log("Server has started. Calling the stripe Plans service...");
    await this.runInitialTask();
  }

  async runInitialTask() {
    await this.updateOrCreatePlans();
  }

  async updateOrCreatePlans() {
    const products = await this.payment.listProducts();

    for (const product of products) {
      if (!product.active) continue;

      // First upsert the product
      await this.prisma.product.upsert({
        where: {
          productId: product.id,
        },
        create: {
          productId: product.id,
          name: product.name,
          description: product.description || null,
          active: product.active,
          images: product.images || [],
          features: product.features || [],
          metadata: product.metadata || {},
          sort: product.metadata?.sort ? Number.parseInt(product.metadata.sort) : null,
        },
        update: {
          name: product.name,
          description: product.description || null,
          active: product.active,
          images: product.images || [],
          features: product.features || [],
          metadata: product.metadata || {},
          sort: product.metadata?.sort ? Number.parseInt(product.metadata.sort) : null,
        },
      });

      // Then handle each price for the product
      for (const price of product.prices) {
        await this.prisma.price.upsert({
          where: {
            priceId: price.id,
          },
          create: {
            priceId: price.id,
            productId: product.id,
            nickname: price.nickname || null,
            active: price.active,
            currency: price.currency,
            unitAmount: price.unit_amount || 0,
            type: price.type,
            billingScheme: price.billing_scheme || null,
            taxBehavior: price.tax_behavior || null,
            isUsageBased: price.type === 'recurring' && price.recurring?.usage_type === 'metered',
            interval: price.recurring?.interval || null,
            intervalCount: price.recurring?.interval_count || null,
            usageType: price.recurring?.usage_type || null,
            aggregateUsage: price.recurring?.aggregate_usage || null,
            trialPeriodDays: price.recurring?.trial_period_days || null,
            metadata: price.metadata || {},
          },
          update: {
            nickname: price.nickname || null,
            active: price.active,
            currency: price.currency,
            unitAmount: price.unit_amount || 0,
            type: price.type,
            billingScheme: price.billing_scheme || null,
            taxBehavior: price.tax_behavior || null,
            isUsageBased: price.type === 'recurring' && price.recurring?.usage_type === 'metered',
            interval: price.recurring?.interval || null,
            intervalCount: price.recurring?.interval_count || null,
            usageType: price.recurring?.usage_type || null,
            aggregateUsage: price.recurring?.aggregate_usage || null,
            trialPeriodDays: price.recurring?.trial_period_days || null,
            metadata: price.metadata || {},
          },
        });
      }
    }

    this.logger.log(`Products and prices updated successfully`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug("Called when the current second is 0");
    this.updateOrCreatePlans().catch(error => {
      this.logger.error("Failed to update plans:", error);
    });
  }
}
