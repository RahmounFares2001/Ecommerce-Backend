import { Expose, Type, Transform } from 'class-transformer';

export class CategoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  @Transform(({ value }) => value ?? undefined)  
  description?: string | null;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Transform(({ value }) => value ?? undefined)
  parentId?: string | null;

  @Expose()
  @Type(() => CategoryResponseDto)
  @Transform(({ value }) => value ?? undefined)
  parent?: CategoryResponseDto | null;

  @Expose()
  @Type(() => CategoryResponseDto)
  children?: CategoryResponseDto[];

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

}