import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { RolesGuard } from './guard';
import { Roles } from './decorator/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post('promote')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  promoteToAdmin(@Body('userEmail') userEmail: string) {
    return this.authService.promoteToAdmin(userEmail);
  }
}
