import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsIn,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { IsEndDateAfterStartDate } from 'src/validator/is-end-date-after-start-date.validator';
import { IsFutureDate } from 'src/validator/is-future-date.validator';
// import { IsDiscountRequiredIfTypeConstraint } from 'src/validator/is-discount-required-if-type.validator';

export class VoucherDto {
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsIn(['percentage', 'fixed', 'free_shipping'], {
    message: "Type must be one of 'percentage', 'fixed', or 'free_shipping'",
  })
  type: 'percentage' | 'fixed' | 'free_shipping';

  @IsIn(['product', 'shipping', 'cart'], {
    message: "Target must be one of 'product', 'shipping', or 'cart'",
  })
  target: 'product' | 'shipping' | 'cart';

  @ValidateIf((o) => o.target === 'product')
  // @IsArray({ message: 'Applicable products must be an array of strings' })
  applicableProducts?: string[];

  @IsNumber()
  @Min(1, { message: 'Discount must be greater than 0' })
  @Max(100, { message: 'Discount must be less than or equal to 100' })
  @ValidateIf((o: any) => o.type === 'percentage')
  percentageDiscount?: number;

  @ValidateIf((o: any) => o.type === 'fixed')
  @IsNumber()
  fixedDiscount?: number;

  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  @IsFutureDate({ message: 'Start date must be in the future' })
  startDate?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'End date is required' })
  @IsEndDateAfterStartDate({ message: 'End date must be after the start date' })
  endDate?: string;

  allowedUsers?: string[];

  maxUsesPerUser?: number;

  minCartValue?: number;
  maxDiscountAmount?: number;

  @IsNumber()
  maxUses: number;

  redeemableDays?: string[];
}
