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
    CategoryModule],
  controllers: [AppController],
  providers: [AppService, UploadService],
})
export class AppModule {}
