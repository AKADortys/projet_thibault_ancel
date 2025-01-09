import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password, res);
    res.status(result.status).json(result);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Logged out successfully' });
    return;
  }
}
