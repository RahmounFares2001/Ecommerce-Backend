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

import { ReturnItemService } from './return-item.service';
import { CreateReturnItemDto } from './dto/create-return-item.dto';
import { UpdateReturnItemDto } from './dto/update-return-item.dto';
import { ReturnItemResponseDto } from './dto/return-item-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { Role } from 'src/common/enums/role.enum';

@Controller('return-items')
export class ReturnItemController {
  constructor(private readonly returnItemService: ReturnItemService) {}

  // add item
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Add item to return' })
  async addItem(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateReturnItemDto,
  ): Promise<ReturnItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnItemService.addItem(user.id, isAdmin, dto);
  }

  // get by id
  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get return item by id' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<ReturnItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnItemService.getById(id, user.id, isAdmin);
  }

  // by return
  @Get('return/:returnId')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get return items by return' })
  async getByReturn(
    @Param('returnId') returnId: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<ReturnItemResponseDto[]> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnItemService.getByReturn(returnId, user.id, isAdmin);
  }

  // update
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update return item quantity' })
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateReturnItemDto,
  ): Promise<ReturnItemResponseDto> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnItemService.updateItem(id, user.id, isAdmin, dto);
  }

  // remove
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Remove return item' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<{ message: string }> {
    const isAdmin = (user as any).role === Role.Admin;
    return await this.returnItemService.removeItem(id, user.id, isAdmin);
  }
}