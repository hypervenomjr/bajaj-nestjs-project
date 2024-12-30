import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDiscountRequiredIfType', async: false })
export class IsDiscountRequiredIfTypeConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const type = args.object['type'];
    if (type === 'percentage') {
      return value !== undefined && value !== null;
    } else if (type === 'fixed') {
      return value !== undefined && value !== null;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const type = args.object['type'];
    if (type === 'percentage') {
      return 'Percentage discount is required when the type is percentage.';
    } else if (type === 'fixed') {
      return 'Fixed discount is required when the type is fixed.';
    }
    return 'Invalid discount type.';
  }
}
