import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    const now = new Date();
    return new Date(date) > now;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Start date must be in the future';
  }
}

export function IsFutureDate(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
