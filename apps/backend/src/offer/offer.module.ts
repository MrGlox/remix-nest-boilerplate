import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
