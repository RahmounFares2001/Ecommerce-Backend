import { IsOptional, IsString } from "class-validator";
import { BaseQueryDto } from "src/common/dto/base-query.dto";

export class ReviewQuery extends BaseQueryDto {
    @IsOptional()
    @IsString()
    rating?: number;
}