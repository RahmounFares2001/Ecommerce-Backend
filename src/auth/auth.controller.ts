import { Body, Controller, Patch, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Request, Response } from 'express';
import { getSessionMeta } from 'src/common/utils/session.meta.util';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { setRefreshTokenCookies } from 'src/common/helpers/set-refresh-token-cookies';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {

  }

  // register
  @Post('register')
  @ApiOperation({summary: 'Register user'})
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({passthrough: true}) res: Response ) : Promise<AuthResponseDto> {
    // get session meta
    const sessionMeta = getSessionMeta(req);

    const result = await this.authService.register(
      registerDto,
      sessionMeta
    );

    // store refresh token cookies
    setRefreshTokenCookies(res, result.refreshToken)

    return {
      accessToken: result.accessToken,
      user: result.user
    }
  }

  // login
  @Post('login')
  @ApiOperation({summary: 'Login user'})
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({passthrough: true}) res: Response): Promise<AuthResponseDto> {
    
    // get session meta
    const sessionMeta = getSessionMeta(req);

    const result = await this.authService.login(
      loginDto,
      sessionMeta
    );

    // store refresh token cookies
    setRefreshTokenCookies(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user
    }

  }

  // logout
  @Post('logout')
  @ApiOperation({summary: 'Logout user'})
  async logout(
    @RefreshToken() refreshToken: string,
    @Res({passthrough: true}) res: Response
  ) {
    await this.authService.logout(refreshToken);

    // clear cookies
    res.clearCookie('refreshToken');

    return;
  }

  // refresh access token
  @Post('refresh-token')
  @ApiOperation({summary: 'Refresh user token'})
  async refreshToken(
    @RefreshToken() oldRefreshToken: string,
    @Res({passthrough: true}) res: Response
  ): Promise<AuthResponseDto> {
    
    const result = await this.authService.refreshToken(oldRefreshToken);

    // store refresh token cookies
    setRefreshTokenCookies(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user
    }
  }

  // change password
  @Patch('change-password')
  @ApiOperation({summary: 'Change user password'})
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser('id') userId: string
  ) {
    return await this.authService.changePassword(userId, changePasswordDto);
  }

  // verify email
  @Patch('verify-email')
  @ApiOperation({summary: 'Verify email user'})
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  // forgot password
  @Post('forgot-password')
  @ApiOperation({summary: 'Forgot password user'})
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  // reset password
  @Patch('reset-password')
  @ApiOperation({summary: 'Reset password user'})
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return await this.authService.resetPassword(resetPasswordDto);
  }


}
