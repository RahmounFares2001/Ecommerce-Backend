import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantDto } from './dto/product-variant.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('product-variants')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  // create variant
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create product variant' })
  async createVariant(
    @Body() dto: CreateProductVariantDto,
  ): Promise<ProductVariantDto> {
    return await this.productVariantService.createVariant(dto);
  }

  // get variant by id
  @Get(':id')
  @ApiOperation({ summary: 'Get variant by id' })
  async getVariantById(@Param('id') id: string): Promise<ProductVariantDto> {
    return await this.productVariantService.getVariantById(id);
  }

  // get variants by product
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get variants by product' })
  async getVariantsByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductVariantDto[]> {
    return await this.productVariantService.getVariantsByProductId(productId);
  }

  // update variant
  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update product variant' })
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateProductVariantDto,
  ): Promise<ProductVariantDto> {
    return await this.productVariantService.updateVariant(id, dto);
  }

  // delete variant
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete product variant' })
  async deleteVariant(@Param('id') id: string): Promise<{ message: string }> {
    return await this.productVariantService.deleteVariant(id);
  }
}