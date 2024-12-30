import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, RolesGuard],
  exports: [RolesGuard],
})
export class AuthModule {}
