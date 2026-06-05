import { Expose } from "class-transformer";


export class ProductImageDto {
    @Expose()
    id!: string;
  
    @Expose()
    url!: string;
  
    @Expose()
    altText?: string;
  
    @Expose()
    displayOrder!: number;
  
    @Expose()
    isPrimary!: boolean;
  }