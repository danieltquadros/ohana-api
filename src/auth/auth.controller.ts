import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { ConvertGuestToUserDto } from './dto/convert-guest-to-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * Create GUEST user for quick checkout
   * POST /api/auth/guest
   */
  @Post('guest')
  async createGuest(@Body() createGuestDto: CreateGuestDto) {
    return this.authService.createGuest(createGuestDto);
  }

  /**
   * Convert GUEST to full USER by adding email and password
   * POST /api/auth/convert-to-user
   */
  @UseGuards(JwtAuthGuard)
  @Post('convert-to-user')
  async convertGuestToUser(
    @Request() req,
    @Body() convertDto: ConvertGuestToUserDto,
  ) {
    return this.authService.convertGuestToUser(req.user.id, convertDto);
  }
}
