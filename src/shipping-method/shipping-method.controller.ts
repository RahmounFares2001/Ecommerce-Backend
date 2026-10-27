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

import { ShippingMethodService } from './shipping-method.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethodResponseDto } from './dto/shipping-method-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('shipping-methods')
export class ShippingMethodController {
  constructor(private readonly shippingMethodService: ShippingMethodService) {}

  // create (admin)
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create shipping method (admin)' })
  async create(
    @Body() dto: CreateShippingMethodDto,
  ): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.create(dto);
  }

  // public: active shipping methods
  @Get('active')
  @ApiOperation({ summary: 'Get active shipping methods' })
  async findActive(): Promise<ShippingMethodResponseDto[]> {
    return await this.shippingMethodService.findActive();
  }

  // admin: all
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all shipping methods (admin)' })
  async findAll(): Promise<ShippingMethodResponseDto[]> {
    return await this.shippingMethodService.findAll();
  }

  // get by id
  @Get(':id')
  @ApiOperation({ summary: 'Get shipping method by id' })
  async findOne(@Param('id') id: string): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.findOne(id);
  }

  // update (admin)
  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update shipping method (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
  ): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.update(id, dto);
  }

  // delete (admin)
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete shipping method (admin)' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.shippingMethodService.remove(id);
  }
}