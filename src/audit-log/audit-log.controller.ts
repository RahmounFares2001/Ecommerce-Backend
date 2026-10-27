import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';

import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('audit-logs')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.Admin)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  // list with filters
  @Get()
  @ApiOperation({ summary: 'List audit logs (admin)' })
  async findAll(
    @Query() query: AuditLogQueryDto,
  ): Promise<AuditLogResponseDto[]> {
    return await this.auditLogService.findAll(query);
  }

  // by id
  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by id (admin)' })
  async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
    return await this.auditLogService.findOne(id);
  }

  // by order
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get audit logs for an order (admin)' })
  async findByOrder(
    @Param('orderId') orderId: string,
  ): Promise<AuditLogResponseDto[]> {
    return await this.auditLogService.findByOrder(orderId);
  }
}