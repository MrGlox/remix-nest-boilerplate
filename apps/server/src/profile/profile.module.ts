import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PrismaModule } from '../core/database/prisma.module';
import { PrismaService } from '../core/database/prisma.service';

import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [ProfileController],
  providers: [PrismaService, ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
