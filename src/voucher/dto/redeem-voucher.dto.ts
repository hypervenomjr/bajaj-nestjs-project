import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RedeemVoucherDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  cartValue: number;

  productsInCart: string[];
}
