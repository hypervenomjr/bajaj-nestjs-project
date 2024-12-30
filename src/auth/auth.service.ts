import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    let role = 'USER';
    if (dto.adminKey && dto.adminKey === process.env.ADMIN_SECRET) {
      role = 'ADMIN';
    } else if (dto.adminKey) {
      throw new ForbiddenException('Invalid admin key');
    }
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          role,
        },
      });
      return this.signToken(user.id, user.email, user.role);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('A user with this email already exists');
        }
      }
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid email or password');
    }

    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Invalid email or password');
    }
    return this.signToken(user.id, user.email, user.role);
  }

  async promoteToAdmin(userEmail: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        throw new ForbiddenException('User not found.');
      }

      if (user.role === 'ADMIN') {
        throw new ForbiddenException('User is already an ADMIN.');
      }

      return this.prisma.user.update({
        where: { email: userEmail },
        data: { role: 'ADMIN' },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new ForbiddenException('User not found.');
        }
      }
      throw new ForbiddenException('Failed to promote user to ADMIN.');
    }
  }
  async signToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
