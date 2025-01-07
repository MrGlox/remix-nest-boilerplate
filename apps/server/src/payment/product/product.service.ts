import { Injectable } from '@nestjs/common';

import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  public readonly createProduct = async (data: Product): Promise<Product> => {
    const newProduct = await this.prisma.product.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    return newProduct;
  }

  // public readonly updateProduct = async (): Promise<string> =>  {
    
  // }
}
