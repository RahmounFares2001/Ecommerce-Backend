// src/return/return.controller.ts
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

import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ReturnResponseDto } from './dto/return-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';

@Controller('returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  // create
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Request a return' })
  async createReturn(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateReturnDto,
  ): Promise<ReturnResponseDto> {
    return await this.returnService.createReturn(user.id, dto);
  }

  // my returns
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get my returns' })
  async getMyReturns(
    @CurrentUser() user: JwtPayloadType,
  ): Promise<ReturnResponseDto[]> {
    return await this.returnService.getMyReturns(user.id);
  }

  // admin: all
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all returns (admin)' })
  async getAllReturns(): Promise<ReturnResponseDto[]> {
    return await this.returnService.getAllReturns();
  }

  // by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get return by id' })
  async getReturnById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<ReturnResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnService.getReturnById(id, user.id, isAdmin);
  }

  // admin: update status
  @Patch(':id/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update return status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnStatusDto,
  ): Promise<ReturnResponseDto> {
    return await this.returnService.updateStatus(id, dto);
  }

  // cancel (owner, pending only)
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Cancel pending return' })
  async cancelReturn(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    return await this.returnService.cancelReturn(id, user.id);
  }
}