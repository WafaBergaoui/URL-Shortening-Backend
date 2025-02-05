import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url, UrlSchema } from './url.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]), // Register the schema
  ],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService], // Export the service if it's needed elsewhere
})
export class UrlModule {}
