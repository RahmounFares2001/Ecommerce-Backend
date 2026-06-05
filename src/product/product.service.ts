import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';
import { ReviewResponseDto } from 'src/review/dto/review-response.dto';
import { ReviewQuery } from 'src/common/dto/review-query';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService
    ) {}

    // get all products
    async getALlProducts(query: ProductQueryDto): 
        Promise<{
            data: ProductResponseDto[];
            total: Number;
            pages: Number
        }> {
        
        const {search, page = 1, limit = 10, categoryId, activeOnly = true} = query;
        const skip = (page - 1)*limit;

        // filters
        const filters: Prisma.ProductWhereInput = {}

        filters.isActive = activeOnly;

        if(categoryId) {
            filters.categoryId = categoryId;
        }

        if(search) {
            filters.OR =  [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive} },
                { slug: { contains: search, mode: Prisma.QueryMode.insensitive} },
                { description: { contains: search, mode: Prisma.QueryMode.insensitive} }
            ]
        }
      
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
        // get base product
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                categoryId: true,
                variants: {
                    select: {
                        price: true,
                    }
                }
            }
        });

        if(!product) {
            throw new NotFoundException('Product not found');
        }

        // get condidates
        const condidates = await this.prisma.product.findMany({
            where: {
                id: { not: productId },
                isActive: true,
                categoryId: product.categoryId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                images: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { 
                        url: true,
                        altText: true
                    }
                }, 
                variants: {
                    select: {
                        price: true
                    }
                }
            },
            take: 200
        })


        // ranking
        const scored = condidates.map((p) => {
            let score = 0;

            // category match
            if(p.categoryId === product.categoryId) {
                score+= 50;
            };

            // price
            const priceDiff = Math.abs(Number(product.variants[0]) - Number(p.variants[0]));
            const priceRatio = priceDiff / Number(product.variants[0]);

            if(priceRatio <= 0.2) {
                score+= 20;
            };

            // recent products
            const daysOld = (Date.now() - new Date(p.createdAt).getTime());

            if(daysOld < 30) {
                score += 5;
            };

            return {
                ...p,
                score
            }
        });

        // sort by relevent score
        const ranked = scored.sort((a,b) => b.score - a.score);

        const result = ranked.slice(0, 12).map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            images: p.images,
        }));


        return toDto(ProductResponseDto, result)
    }

}
