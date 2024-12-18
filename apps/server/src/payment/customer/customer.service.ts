import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {}

  async createCustomer(userId: string): Promise<string> {
    // Récupérer l'utilisateur dans la base de données
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
    });

    console.log('customer', customer);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async retrieveCustomer(userId: string): Promise<string> {
    // Récupérer l'utilisateur dans la base de données
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // console.log('profile', user?.profile);

    if (!user) {
      throw new Error('User not found');
    }

    let customer = null;

    if (!user.stripeCustomerId) {
      console.log('Stripe customer ID not found');

      customer = await this.stripe.customers.create({
        name: user.pseudo || '',
        email: user.email,
        // address: {
        //   line1: user.profile.address,
        //   city: user.profile.city,
        //   postal_code: user.profile.zipCode,
        //   country: user.profile.country,
        // },
      });
    } else {
      customer = await this.stripe.customers.retrieve(user.stripeCustomerId);
    }

    console.log('customer', customer);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
}
