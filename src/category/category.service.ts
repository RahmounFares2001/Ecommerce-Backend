import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { toDto } from 'src/common/utils/to-dto.util';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
    constructor(
        private prisma: PrismaService
    ) {}

    // create category
    async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.create({
            data: createCategoryDto
        });

        return toDto(CategoryResponseDto, category);
    }


    // get all categories
    async getAllCategories(): Promise<CategoryResponseDto[]> {
        const categories = await this.prisma.category.findMany({});
        
        return toDto(CategoryResponseDto, categories);    
    }

    // get catagory by id 
    async getCategoryById(id: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id }
        })

        if(!category) {
            throw new NotFoundException('There is no categories');
        }

        return toDto(CategoryResponseDto, category);
    }

    // get by slug
    async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { slug }
        });

        if(!category) {
            throw new NotFoundException('Category not found');
        }

        return toDto(CategoryResponseDto, category);
    }

    // get root categories
    async getRootCategories(): Promise<CategoryResponseDto[]> {
        const rootCategories = await this.prisma.category.findMany({
            where: { parent: null }
        });

        return toDto(CategoryResponseDto, rootCategories);
    }

    // get children
    async getChildren(id: string): Promise<CategoryResponseDto[]> {
        const children = await this.prisma.category.findMany({
            where: { parentId: id },
        });


        return toDto(CategoryResponseDto, children);
    }

    // update category
    async updateCategory(
        id: string,
        updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: updateCategoryDto
        });

        return toDto(CategoryResponseDto, updatedCategory);
    }
    
    // Activate category
    async activateCategory(id: string): Promise<CategoryResponseDto> {
        const activatedCategory = await this.prisma.category.update({
            where: { id },
            data: {
                isActive: true
            }
        });

        return toDto(CategoryResponseDto, activatedCategory);
    }
    
    // Disactivate Category
    async disactivateCategory(id: string): Promise<CategoryResponseDto> {
        const activatedCategory = await this.prisma.category.update({
            where: { id },
            data: {
                isActive: false
            }
        });

        return toDto(CategoryResponseDto, activatedCategory);
    }
    // delete category
    async deleteCategory(id: string) {
        await this.prisma.category.delete({
            where: { id }
        })

        return;
    }
}
