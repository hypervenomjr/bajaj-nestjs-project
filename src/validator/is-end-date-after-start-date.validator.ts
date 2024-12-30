import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsEndDateAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDate: string, args: ValidationArguments) {
    const startDate = args.object['startDate'];
    return new Date(endDate) > new Date(startDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be after start date';
  }
}

export function IsEndDateAfterStartDate(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEndDateAfterStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEndDateAfterStartDateConstraint,
    });
  };
}
