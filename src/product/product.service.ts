import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';
import { ReviewResponseDto } from 'src/review/dto/review-response.dto';
import { ReviewQuery } from 'src/common/dto/review-query';
import { contains } from 'class-validator';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService
    ) {}

    // build product filters
    private buildProductFilters(query: ProductQueryDto): Prisma.ProductWhereInput {
      const { search, categoryId, activeOnly = true } = query;
    
      const filters: Prisma.ProductWhereInput = {
        isActive: activeOnly,
      };
    
      if (categoryId) {
        filters.categoryId = categoryId;
      }
    
      if (search) {
        filters.OR = [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ];
      }
    
      return filters;
    }

    // get all products
    async getAllProducts(query: ProductQueryDto): 
        Promise<{
            data: ProductResponseDto[];
            total: Number;
            pages: Number
        }> {
        
        const {page = 1, limit = 10} = query;
        const skip = (page - 1)*limit;

        // filters
        const filters = this.buildProductFilters(query);
      
        // find Product, count all
        const [products, total] = await Promise.all([
            // find products
            this.prisma.product.findMany({
                where: filters,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    variants: {
                        where: { isActive: true } 
                    }
            }}),

            this.prisma.product.count({ where: filters })
        ]) 
        
       

        return {
            data: toDto(ProductResponseDto, products),
            total,
            pages: Math.ceil(total / limit)
        }
    }

    // get product by id 
    async getProductById(id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id }
        });

        if(!product) {
            throw new NotFoundException('Product not found');
        }

        return toDto(ProductResponseDto, product)
    }

    // get product by slug
    async getProductBySlug(slug: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { slug }
        });

        if(!product) {
            throw new NotFoundException('Product not found');
        }

        return toDto(ProductResponseDto, product)
    }

    // get reviews of product
    async getProductReviews(
        productId: string,
        reviewQuery: ReviewQuery): Promise<ReviewResponseDto[]> {

        const {page = 1, limit = 10, sort= 'rating_asc', rating} = reviewQuery;
        const skip = (page-1)*limit;

        // order by review
        var orderBy: Prisma.ReviewOrderByWithRelationInput = { 
            createdAt: 'desc' };
        if(sort === 'rating_asc') {
            orderBy = { rating: 'asc' };
        } else if(sort === 'rating_desc') {
            orderBy = { rating: 'desc' };
        }

        const reviews = await this.prisma.review.findMany({
            where: { productId },
            skip,
            take: limit,
            orderBy,
        })

        return toDto(ReviewResponseDto, reviews);
    }

    // get related products
    async getRelatedProducts(productId: string): Promise<ProductResponseDto[]> {
        // 1. Get base product with variant price
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                categoryId: true,
                variants: {
                    select: {
                        price: true,
                    },
                    take: 1,
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const basePrice = Number(product.variants[0]?.price ?? 0);

        // 2. Fetch candidates matching category
        const candidates = await this.prisma.product.findMany({
            where: {
                id: { not: productId },
                isActive: true,
                categoryId: product.categoryId,
            },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
                variants: {
                    where: { isActive: true },
                },
            },
            take: 200,
        });

        // 3. Score candidates
        const scored = candidates.map((p) => {
            let score = 0;

            // Category match
            if (p.categoryId === product.categoryId) {
                score += 50;
            }

            // Price comparison (using candidate variant price)
            const candidatePrice = Number(p.variants[0]?.price ?? 0);
            if (basePrice > 0) {
                const priceDiff = Math.abs(basePrice - candidatePrice);
                const priceRatio = priceDiff / basePrice;

                if (priceRatio <= 0.2) {
                    score += 20;
                }
            }

            // Recency calculation (convert ms to days)
            const daysOld = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysOld < 30) {
                score += 5;
            }

            return {
                ...p,
                score,
            };
        });

        // 4. Sort by score and transform top 12
        const ranked = scored.sort((a, b) => b.score - a.score);

        return toDto(ProductResponseDto, ranked.slice(0, 12));
    }

    // get featured products
    async getFeaturedProducts(query: ProductQueryDto)
    : Promise<{
        data: ProductResponseDto[],
            total: Number,
            pages: Number }> {

        const {page = 1, limit = 10} = query;
        const skip = ( page-1 )*limit;

        // filters
        const filters = this.buildProductFilters(query);

        

        const [products, total] = await Promise.all([

            this.prisma.product.findMany({
                where: filters,
                take: limit,
                skip,
                orderBy: { createdAt: 'desc'},

                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    variants: {
                        where: { isActive: true }
                    }
                }

            }),

            this.prisma.product.count({ where: filters })
        ])

        return {
            data: toDto(ProductResponseDto, products),
            total,
            pages: Math.ceil(total/limit)
        }
    }

}
