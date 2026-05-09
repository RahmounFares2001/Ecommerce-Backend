import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Request, Response } from 'express';
import { getSessionMeta } from 'src/common/utils/session.meta.util';
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator';
import { setRefreshTokenCookies } from 'src/common/helpers/set-refresh-token-cookies';

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

    // refresh token to cookies
    setRefreshTokenCookies(res, result.refreshToken)

    return {
      accessToken: result.accessToken,
      user: result.user
    }
  }

  // login

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
  @Post('refreshToken')
  @ApiOperation({summary: 'Refresh user token'})
  async refreshToken(
    @RefreshToken() refreshToken: string,
    @Res({passthrough: true}) res: Response
  ) {
    return await this.authService.refreshToken(refreshToken);
  }

  // change password

  // forgot password

  // reset password

  // verify email

  // verify phone
}
