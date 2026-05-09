import { SupportedCurrency, SupportedLocale, UserRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({value}) => value.toLowerCase().trim())
    email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
    })
    password!: string;

    @IsOptional()
    @IsString()
    firstName!: string | undefined;

    @IsOptional()
    @IsString()
    lastName!: string | undefined;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9\s-]{8,15}$/, { message: 'Invalid phone number format' })
    phone!: string | undefined;
    
}
