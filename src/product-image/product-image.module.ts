import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [ProductImageController],
  providers: [ProductImageService],
  exports: [ProductImageService]
})
export class ProductImageModule {}
