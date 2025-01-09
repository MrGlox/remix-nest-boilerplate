import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import Stripe from 'stripe';

import { PrismaService } from '../../core/database/prisma.service';

interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
  features: string[];
}

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    @Inject("STRIPE") private readonly stripe: Stripe,
  ) { }


  async onModuleInit() {
    this.logger.log("Server has started. Calling the stripe Plans service...");
    await this.runInitialTask();
  }

  async runInitialTask() {
    await this.updateOrCreatePlans();
  }

  public readonly listStripeProducts = async (
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
      } catch (err) {
        // If JSON parsing fails, try splitting by delimiter
        this.logger.error(`Failed to parse features for product ${product.id}: ${err}`);
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

  async updateOrCreatePlans() {
    const products = await this.listStripeProducts();

    for (const product of products) {
      if (!product.active) return;

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

  public readonly createProduct = async (data: Omit<Product, "createdAt" | "updatedAt">): Promise<Product> => {
    const newProduct = await this.prisma.product.upsert({
      where: {
        productId: data.productId,
      },
      create: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      update: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    return newProduct;
  }

  public readonly updateProduct = async (data: Product): Promise<Product> => {
    const updatedProduct = await this.prisma.product.upsert({
      create: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      update: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      where: {
        id: data.id
      }
    });

    return updatedProduct;
  }
}
