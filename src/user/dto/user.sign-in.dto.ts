import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class UserSignInDto {
	@IsString({ message: 'should be string' })
	@IsNotEmpty({ message: 'should be not empty' })
	@IsEmail({ message: 'should be email' })
	@MaxLength(200)
	email: string;

	@IsString({ message: 'should be string' })
	@IsNotEmpty({ message: 'should be not empty' })
	@MaxLength(200)
	password: string;
}
