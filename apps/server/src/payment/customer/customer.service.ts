import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import { Address, Profile } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('STRIPE') private readonly stripe: Stripe,
  ) {}

  public readonly createCustomer = async (userId: string): Promise<string> => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  public readonly updateCustomer = async (
    userId: string,
    data: Address & Profile,
  ): Promise<string> =>  {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new Error('Stripe customer ID not found');
    }


    const { firstName, lastName, birthday, ...rest } = data;

    const customer = await this.stripe.customers.update(
      user?.stripeCustomerId,
      {
        name: `${firstName} ${lastName}`,
        address: {
          ...(rest as Stripe.AddressParam),
        },
      },
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  public readonly retrieveCustomer = async (userId: string): Promise<Stripe.Customer> => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let customer = null;

    if (!user.stripeCustomerId) {
      customer = await this.stripe.customers.create({
        name: user.pseudo || '',
        email: user.email,
      });
    } else {
      customer = await this.stripe.customers.retrieve(user.stripeCustomerId);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer as Stripe.Customer;
  }

  public readonly createOrUpdateProfile = async (
    userId: string,
    data: Omit<Profile, 'userId'>,
  ): Promise<Profile> => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        stripeCustomerId: true,
        profile: true,
      },
    });

    let profile: Profile | undefined;

    if (!user?.profile) {
      profile = await this.prisma.profile.create({
        data: {
          ...data,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return profile;
    }

    profile = await this.prisma.profile.update({
      data: {
        ...data,
      },
      where: {
        userId,
      },
    });

    if (!user.stripeCustomerId) {
      throw new Error('Stripe customer ID not found');
    }

    const { firstName, lastName } = data;
    await this.stripe.customers.update(user?.stripeCustomerId, {
      name: `${firstName} ${lastName}`,
    });

    return profile;
  };

  public readonly createOrUpdateAddress = async (
    userId: string,
    data: Omit<Address, 'userId'>,
  ): Promise<Address> => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        address: true,
        stripeCustomerId: true,
      },
    });

    let address: Address | undefined;

    if (!user?.address) {
      address = await this.prisma.address.create({
        data: {
          ...data,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return address;
    }

    address = await this.prisma.address.update({
      data: {
        ...data,
      },
      where: {
        userId,
      },
    });

    if (!user.stripeCustomerId) {
      throw new Error('Stripe customer ID not found');
    }

    const { postalCode, state, street, ...rest } = data;
    await this.stripe.customers.update(user?.stripeCustomerId, {
      address: {
        ...rest,
        line1: street || undefined,
        postal_code: postalCode || undefined,
        state: state || undefined,
      },
    });

    return address;
  };
}
