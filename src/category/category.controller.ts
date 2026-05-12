import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {
  }


  // create category
  @Post()
  @ApiOperation({summary: 'Create new category'})
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  // get all categories
  @Get()
  @ApiOperation({summary: 'Get all categories'})
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getAllCategories();
  }

  // get one
  @Get(':id')
  @ApiOperation({summary: 'Get category by id'})
  async getCategoryById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoryService.getCategoryById(id);
  }

  // get by slug
  @Get('slug/:slug')
  @ApiOperation({summary: 'Get category by slug'})
  async getCategoryBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  // get root categories
  @Get('root')
  @ApiOperation({summary: 'Get category by slug'})
  async getRootCategories(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getRootCategories();
  }

  @Get(':id/children')
  @ApiOperation({summary: 'Get children'})
  async getChildren(@Param('id') id: string): Promise<CategoryResponseDto[]> {
    return await this.categoryService.getChildren(id);
  }

  // update category
  @Patch(":id")
  @ApiOperation({summary: 'Update category'})
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id') id: string): Promise<CategoryResponseDto> {
      return await this.categoryService.updateCategory(id, updateCategoryDto);
  }

  // activate category
  @Patch(":id/activate")
  @ApiOperation({summary: 'Update category'})
  async activateCategory(
    @Param('id') id: string): Promise<CategoryResponseDto> {
      return await this.categoryService.activateCategory(id);
  }

  // disactivate category
  @Patch(":id/disactivate")
  @ApiOperation({summary: 'Update category'})
  async disactivateCategory(
    @Param('id') id: string): Promise<CategoryResponseDto> {
      return await this.categoryService.disactivateCategory(id);
  }

  // delete category
  @Delete(":id")
  @ApiOperation({summary: 'Get category'})
  async deleteCategory(@Param('id') id: string) {
    return await this.categoryService.deleteCategory(id);
  }
}
