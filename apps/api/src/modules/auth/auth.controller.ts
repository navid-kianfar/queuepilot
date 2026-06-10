import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

const FAILED_LOGIN_DELAY_MS = 300;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('status')
  status() {
    return { enabled: this.authService.enabled };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    if (!this.authService.enabled) {
      throw new BadRequestException('Authentication is not enabled');
    }
    try {
      return this.authService.login(dto.username, dto.password);
    } catch (err) {
      // Dampen brute-force attempts
      await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
      throw err;
    }
  }
}
