import { plainToInstance, ClassConstructor } from 'class-transformer';

// Overload signatures
export function toDto<T>(cls: ClassConstructor<T>, raw: object[]): T[];
export function toDto<T>(cls: ClassConstructor<T>, raw: object): T;

export function toDto<T>(cls: ClassConstructor<T>, raw: object | object[]): T | T[] {
  return plainToInstance(cls, raw, {
    excludeExtraneousValues: true,
  });
}