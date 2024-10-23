import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './core/database/prisma.service';
import { RemixController } from './core/remix/remix.controller';
import { RemixService } from './core/remix/remix.service';

@Module({
  imports: [AuthModule],
  controllers: [AuthController, RemixController],
  providers: [PrismaService, RemixService],
})
export class AppModule {}
