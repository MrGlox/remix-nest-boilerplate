import { Injectable } from '@nestjs/common';

import { PrismaService } from '../core/database/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // async createProfile(userId: string): Promise<void> {
  //   await this.prisma.profile.create({
  //   });
  // }
}
