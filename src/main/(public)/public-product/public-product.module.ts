import { Module } from '@nestjs/common';
import { PublicProductController } from './public-product.controller';
import { PublicProductService } from './public-product.service';
import { StorageModule } from 'src/global/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [PublicProductController],
  providers: [PublicProductService]
})
export class PublicProductModule {}

