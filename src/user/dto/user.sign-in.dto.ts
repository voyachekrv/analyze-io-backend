import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

/**
 * Данные для авторизации пользователя
 */
export class UserSignInDto {
	/**
	 * Email
	 */
	@IsString({ message: 'should be string' })
	@IsNotEmpty({ message: 'should be not empty' })
	@IsEmail({ message: 'should be email' })
	@MaxLength(200)
	email: string;

	/**
	 * Пароль
	 */
	@IsString({ message: 'should be string' })
	@IsNotEmpty({ message: 'should be not empty' })
	@MaxLength(200)
	password: string;
}
