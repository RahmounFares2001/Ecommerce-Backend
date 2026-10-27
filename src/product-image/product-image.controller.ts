import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImageDto } from './dto/product-image.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('product-images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  // upload product image
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductImageDto,
  ): Promise<ProductImageDto> {
    return await this.productImageService.uploadProductImage(file, dto);
  }

  // get product images
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product images' })
  async getProductImages(
    @Param('productId') productId: string,
  ): Promise<ProductImageDto[]> {
    return await this.productImageService.getProductImages(productId);
  }

  // update image
  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update product image' })
  async updateImage(
    @Param('id') id: string,
    @Body() dto: UpdateProductImageDto,
  ): Promise<ProductImageDto> {
    return await this.productImageService.updateImage(id, dto);
  }

  // delete image
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete product image' })
  async deleteImage(@Param('id') id: string): Promise<{ message: string }> {
    return await this.productImageService.deleteImage(id);
  }
}