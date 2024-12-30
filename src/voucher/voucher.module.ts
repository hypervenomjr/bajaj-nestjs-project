import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { RolesGuard } from 'src/auth/guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [VoucherController],
  providers: [VoucherService, RolesGuard, JwtService],
  exports: [RolesGuard],
})
export class VoucherModule {}
