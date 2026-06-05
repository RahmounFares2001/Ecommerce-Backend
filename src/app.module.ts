import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ProductImageModule } from './product-image/product-image.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    UsersModule,
    AddressesModule,
    AuthModule,
    MailModule,
    UploadModule,
    CategoryModule,
    ProductModule,
    ProductImageModule,
    ProductVariantModule,
    ReviewModule],
  controllers: [AppController],
  providers: [AppService, UploadService],
})
export class AppModule {}
