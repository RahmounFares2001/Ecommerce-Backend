import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiOperation } from '@nestjs/swagger';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ReviewResponseDto } from 'src/review/dto/review-response.dto';
import { ReviewQuery } from 'src/common/dto/review-query';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // get all products
  @Get()
  @ApiOperation({summary: 'Get all products'})
  async getAllProducts(
    @Query() baseQuery: ProductQueryDto
  ): Promise<{
        data: ProductResponseDto[];
        total: Number;
        pages: Number
      }> {
    return await this.productService.getAllProducts(baseQuery);
  }

  // get product by slug
  @Get('slug/:slug')
  @ApiOperation({summary: 'Get all products with variants and images'})
  async getProductBySlug(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return await this.productService.getProductBySlug(slug);
  }


  // get product by id
  @Get(':id')
  @ApiOperation({summary: 'Get product with variants and images'})
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.productService.getProductById(id);
  }


  // get reviews of a product
  @Get(':id/reviews')
  @ApiOperation({summary: 'Get all products with variants and images'})
  async getProductReviews(
    @Param('id') productId: string,
    @Query() reviewQuery: ReviewQuery): Promise<ReviewResponseDto[]> {
    return await this.productService.getProductReviews(productId, reviewQuery);
  }

  
  // related products
  @Get(':id/related')
  @ApiOperation({summary: 'Get related products'})
  async getRelatedProducts(
    @Param('id') productId: string
  ): Promise<ProductResponseDto[]> {
    return await this.productService.getRelatedProducts(productId);
  }
  
  // featured products
  @Get('featured')
  @ApiOperation({summary: 'Get featued products'})
  async getFeaturedProducts(
    @Query() baseQuery: ProductQueryDto
  ): Promise<{
      data: ProductResponseDto[],  
      total: Number;
      pages: Number } > {
    return await this.productService.getFeaturedProducts(baseQuery);
  }


  
}
