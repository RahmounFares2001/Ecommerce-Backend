import { Transform } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator"

export class LoginDto {
    @Transform(({value}) => value.toLowerCase().trim())
    @IsEmail()
    @IsNotEmpty()
    email!: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
    })
    password!: string
}