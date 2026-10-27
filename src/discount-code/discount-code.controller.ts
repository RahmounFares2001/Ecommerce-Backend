// src/discount-code/discount-code.controller.ts
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

import { DiscountCodeService } from './discount-code.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { DiscountCodeResponseDto } from './dto/discount-code-response.dto';
import { DiscountValidationResponseDto } from './dto/discount-validation-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('discount-codes')
export class DiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  // create 
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create discount code (admin)' })
  async create(
    @Body() dto: CreateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    return await this.discountCodeService.create(dto);
  }

  // validate 
  @Post('validate')
  @ApiOperation({ summary: 'Validate a discount code' })
  async validate(
    @Body() dto: ValidateDiscountCodeDto,
  ): Promise<DiscountValidationResponseDto> {
    return await this.discountCodeService.validate(dto);
  }

  // list all
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all discount codes (admin)' })
  async findAll(): Promise<DiscountCodeResponseDto[]> {
    return await this.discountCodeService.findAll();
  }

  // get by id 
  @Get(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get discount code by id (admin)' })
  async findOne(@Param('id') id: string): Promise<DiscountCodeResponseDto> {
    return await this.discountCodeService.findOne(id);
  }

  // update 
  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update discount code (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountCodeDto,
  ): Promise<DiscountCodeResponseDto> {
    return await this.discountCodeService.update(id, dto);
  }

  // delete
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete discount code (admin)' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.discountCodeService.remove(id);
  }
}