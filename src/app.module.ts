import { Module } from '@nestjs/common';
import { VoucherModule } from './voucher/voucher.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [VoucherModule, UserModule, PrismaModule, AuthModule],
  providers: [PrismaService],
})
export class AppModule {}
