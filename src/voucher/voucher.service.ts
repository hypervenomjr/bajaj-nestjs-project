import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VoucherDto } from './dto';
import { Voucher } from '@prisma/client';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);
  constructor(private prisma: PrismaService) {}

  // Create a new voucher
  async createVoucher(dto: VoucherDto): Promise<Voucher> {
    const voucherWithSameCode = await this.prisma.voucher.findUnique({
      where: {
        code: dto.code,
      },
    });

    if (voucherWithSameCode) {
      this.logger.warn(
        `Voucher creation failed. Code: ${dto.code} already exists.`,
      );
      throw new ConflictException(
        `Voucher creation failed. Code: ${dto.code} already exists.`,
      );
    }

    if (!this.isVoucherDateRangeValid(dto)) {
      this.logger.error(
        `Voucher creation failed. Invalid date range for voucher code: ${dto.code}`,
      );
      throw new ConflictException(
        `Voucher creation failed. Invalid date range for voucher code: ${dto.code}`,
      );
    }

    if (
      dto.target === 'product' &&
      (!dto.applicableProducts || dto.applicableProducts.length === 0)
    ) {
      this.logger.error(
        `Voucher creation failed. Applicable products are required when the target is 'product'.`,
      );
      throw new ConflictException(
        `Voucher creation failed. Applicable products are required when the target is 'product'.`,
      );
    }

    try {
      const newVoucher = await this.prisma.voucher.create({
        data: {
          code: dto.code,
          type: dto.type,
          target: dto.target,
          applicableProducts: dto.applicableProducts
            ? [...dto.applicableProducts]
            : [],
          discount:
            dto.type === 'percentage'
              ? dto.percentageDiscount
              : dto.fixedDiscount,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          maxUses: dto.maxUses,
          maxUsesPerUser: dto.maxUsesPerUser ?? 1,
          allowedUsers: dto.allowedUsers ?? [],
          redeemableDays: dto.redeemableDays ?? [],
          minCartValue: dto.minCartValue,
          maxDiscountAmount: dto.maxDiscountAmount,
        },
      });

      this.logger.log(`Voucher with code ${dto.code} created successfully.`);
      return newVoucher;
    } catch (error) {
      this.logger.error(
        `Voucher creation failed for code: ${dto.code}. Error: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to create voucher. Please try again later.');
    }
  }

  // Update an existing voucher by its code
  async updateVoucher(code: string, dto: VoucherDto): Promise<Voucher> {
    const voucherToUpdate = await this.prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucherToUpdate) {
      this.logger.warn(`Voucher update failed. Code: ${code} not found.`);
      throw new NotFoundException(
        `Voucher update failed. Code: ${code} not found.`,
      );
    }

    if (!this.isVoucherDateRangeValid(dto)) {
      this.logger.error(
        `Voucher update failed. Invalid date range for voucher code: ${dto.code}`,
      );
      throw new ConflictException(
        `Voucher update failed. Invalid date range for voucher code: ${dto.code}`,
      );
    }

    try {
      const updatedVoucher = await this.prisma.voucher.update({
        where: { code },
        data: {
          code: dto.code,
          type: dto.type,
          target: dto.target,
          applicableProducts: dto.applicableProducts,
          discount:
            dto.type === 'percentage'
              ? dto.percentageDiscount
              : dto.fixedDiscount,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          maxUses: dto.maxUses,
          maxUsesPerUser: dto.maxUsesPerUser ?? 1,
          allowedUsers: dto.allowedUsers ?? [],
          redeemableDays: dto.redeemableDays ?? [],
          minCartValue: dto.minCartValue,
          maxDiscountAmount: dto.maxDiscountAmount,
        },
      });

      this.logger.log(`Voucher with code ${code} updated successfully.`);
      return updatedVoucher;
    } catch (error) {
      this.logger.error(
        `Voucher update failed for code: ${code}. Error: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to update voucher. Please try again later.');
    }
  }

  // Delete a voucher by its code
  async deleteVoucher(code: string): Promise<{ message: string }> {
    const voucherToDelete = await this.prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucherToDelete) {
      this.logger.warn(`Voucher deletion failed. Code: ${code} not found.`);
      throw new NotFoundException(
        `Voucher deletion failed. Code: ${code} not found.`,
      );
    }

    try {
      await this.prisma.voucher.delete({
        where: { code },
      });

      this.logger.log(`Voucher with code ${code} deleted successfully.`);
      return { message: `Voucher with code ${code} deleted successfully.` };
    } catch (error) {
      this.logger.error(
        `Voucher deletion failed for code: ${code}. Error: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to delete voucher. Please try again later.');
    }
  }

  // Retrieve all vouchers
  async getAllVouchers(): Promise<Voucher[]> {
    try {
      const vouchers = await this.prisma.voucher.findMany({
        orderBy: { startDate: 'asc' },
      });

      this.logger.log(`Successfully retrieved ${vouchers.length} vouchers.`);
      return vouchers;
    } catch (error) {
      this.logger.error(
        `Error retrieving vouchers: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to retrieve vouchers. Please try again later.');
    }
  }

  // Retrieve a specific voucher by its code
  async getVoucherByCode(code: string): Promise<Voucher> {
    try {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code },
      });

      if (!voucher) {
        this.logger.warn(`Voucher with code ${code} not found.`);
        throw new NotFoundException(`Voucher with code ${code} not found.`);
      }

      this.logger.log(`Successfully retrieved voucher with code: ${code}`);
      return voucher;
    } catch (error) {
      this.logger.error(
        `Error retrieving voucher: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to retrieve voucher. Please try again later.');
    }
  }

  async redeemVoucher(dto: RedeemVoucherDto): Promise<{ message: string }> {
    const voucher = await this.prisma.voucher.findUnique({
      where: {
        code: dto.code,
      },
    });
    if (!voucher) {
      throw new NotFoundException(`Voucher with code ${dto.code} not found.`);
    }
    const currentDate = new Date();
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayIndex = currentDate.getDay();
    const dayString = days[dayIndex];
    if (
      new Date(voucher.startDate) > currentDate ||
      new Date(voucher.endDate) < currentDate
    ) {
      throw new BadRequestException(
        `Voucher with code ${dto.code} is not active.`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (
      voucher.allowedUsers.length > 0 &&
      !voucher.allowedUsers.includes(user.email)
    ) {
      throw new ForbiddenException('User not allowed to redeem this voucher.');
    }

    if (
      voucher.redeemableDays.length > 0 &&
      !voucher.redeemableDays.includes(dayString)
    ) {
      throw new ForbiddenException('Voucher cannot be redeemed today');
    }
    if (dto.cartValue < voucher.minCartValue) {
      throw new BadRequestException(
        'Cart value is less than the minimum cart value required to redeem this voucher',
      );
    }

    if (
      voucher.applicableProducts.length > 0 &&
      !voucher.applicableProducts.every((product) =>
        voucher.applicableProducts.includes(product),
      )
    ) {
      throw new BadRequestException(
        'Cart does not contain all the products on which the voucher is redeemable',
      );
    }
    const userVoucher = await this.prisma.userVoucher.findUnique({
      where: {
        userId_voucherId: {
          userId: dto.userId,
          voucherId: voucher.id,
        },
      },
    });

    if (userVoucher && userVoucher.useCount >= voucher.maxUsesPerUser) {
      throw new BadRequestException(
        `Maxiumum redemption limit for ${dto.code} reached.`,
      );
    }
    if (userVoucher) {
      await this.prisma.userVoucher.update({
        where: { id: userVoucher.id },
        data: {
          useCount: userVoucher.useCount + 1,
          redeemedAt: [...userVoucher.redeemedAt, currentDate],
        },
      });
    } else {
      await this.prisma.userVoucher.create({
        data: {
          userId: dto.userId,
          voucherId: voucher.id,
          useCount: 1,
          redeemedAt: [currentDate],
        },
      });
    }

    // const newCartValue = dto.cartValue-discountValue;
    return { message: 'Voucher redeemed successfully' };
  }

  // Check if a voucher is valid
  isVoucherDateRangeValid(dto: VoucherDto) {
    const currentDate = new Date();
    if (
      new Date(dto.startDate) < currentDate ||
      new Date(dto.endDate) < currentDate
    ) {
      return false;
    }
    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      return false;
    }
    return true;
  }
}
