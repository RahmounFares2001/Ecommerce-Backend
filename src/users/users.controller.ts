import { Body, Controller, Delete, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadType } from 'src/common/types/jwt-payload.type';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get current profile
  @Get('me')
  @ApiOperation({summary: 'Get current user'})
  async getMe(@CurrentUser() user: JwtPayloadType) : Promise<UserResponseDto> {
    return await this.usersService.findMe(user.id)
  }

  // update profile
  @Patch('me')
  @UseGuards(AccessTokenGuard)  
  @ApiOperation({summary: 'Update profile informations'})
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: any): Promise<UserResponseDto> {
    
    const userId = req.user.id;
    return await this.usersService.updateProfile(userId, updateProfileDto);
  }


  // update avatar profile
  @Patch('me/avatar')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ avatarUrl: string }> {
    const userId = req.user.id;

    return await this.usersService.updateAvatar(userId, file);
  }

  // delete avatar profile
  @Delete('me/avatar')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({summary: 'Delete profile avatar'})
  async deleteAvatar(@Req() req: any) {
    const userId = req.user.id;
    return await this.usersService.deleteAvatar(userId);
  }

  // delete profile
  @Patch('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({summary: 'Delete user'})
  async deleteMe(@Req() req: any) {
    const userId = req.user.id;
    return await this.usersService.deleteMe(userId);
  }

}
