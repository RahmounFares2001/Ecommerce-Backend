import { plainToInstance, ClassConstructor } from 'class-transformer';

export function toDto<T>(cls: ClassConstructor<T>, raw: object): T {
  return plainToInstance(cls, raw, {
    excludeExtraneousValues: true,
  });
}