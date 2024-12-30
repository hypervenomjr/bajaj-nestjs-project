import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherDto } from './dto';
import { Voucher } from '@prisma/client';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard';

@Controller('voucher')
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  // Create a new voucher
  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  createVoucher(@Body() dto: VoucherDto): Promise<Voucher> {
    return this.voucherService.createVoucher(dto);
  }

  // Update an existing voucher
  @Patch('update')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updateVoucher(
    @Query('code') code: string,
    @Body() dto: VoucherDto,
  ): Promise<Voucher> {
    return this.voucherService.updateVoucher(code, dto);
  }

  // Delete a voucher by its code
  @Delete('delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  deleteVoucher(@Query('code') code: string): Promise<{ message: string }> {
    return this.voucherService.deleteVoucher(code);
  }

  // Retrieve all vouchers
  @Get()
  getAllVouchers(): Promise<Voucher[]> {
    return this.voucherService.getAllVouchers();
  }

  // Retrieve a specific voucher by its code
  @Get(':code')
  getVoucherByCode(@Param('code') code: string): Promise<Voucher> {
    return this.voucherService.getVoucherByCode(code);
  }

  @Post('redeem')
  redeemVoucher(@Body() dto: RedeemVoucherDto): Promise<{ message: string }> {
    return this.voucherService.redeemVoucher(dto);
  }
}
