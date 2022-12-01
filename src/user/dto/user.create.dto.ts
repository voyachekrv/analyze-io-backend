import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Данные для создания пользователя
 */
export class UserCreateDto {
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
