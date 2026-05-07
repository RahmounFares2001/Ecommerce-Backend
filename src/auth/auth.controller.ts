import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {

  }

  // register

  // login

  // logout

  // refresh access token

  // change password

  // forgot password

  // reset password

  // verify email

  // verify phone
}
