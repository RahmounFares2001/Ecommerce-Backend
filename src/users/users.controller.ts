import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get current profile
  @Get('me')
  @ApiOperation({summary: 'Get current user'})
  async getUser(@CurrentUser() user: JwtPayload) : Promise<UserResponseDto> {
    return await this.usersService.findOne(user.id)
  }

  // update profile

  // update avatar profile

  // delete avatar profile

  // delete profile


}
