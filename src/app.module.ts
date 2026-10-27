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
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { OrderStatusHistoryModule } from './order-status-history/order-status-history.module';
import { ShippingMethodModule } from './shipping-method/shipping-method.module';
import { DiscountCodeModule } from './discount-code/discount-code.module';
import { ReturnModule } from './return/return.module';
import { ReturnItemModule } from './return-item/return-item.module';
import { WishListItemModule } from './wish-list-item/wish-list-item.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationModule } from './notification/notification.module';
import { RedisModule } from './redis/redis.module';

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
    ReviewModule,
    CartModule,
    CartItemModule,
    OrderModule,
    OrderItemModule,
    OrderStatusHistoryModule,
    ShippingMethodModule,
    DiscountCodeModule,
    ReturnModule,
    ReturnItemModule,
    WishListItemModule,
    AuditLogModule,
    NotificationModule,
    RedisModule],
  controllers: [AppController],
  providers: [AppService, UploadService],
})
export class AppModule {}
