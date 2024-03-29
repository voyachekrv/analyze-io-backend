import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { UserStrings } from '../../user.strings';

/**
 * Данные для авторизации пользователя
 */
export class UserSignInDto {
	/**
	 * Email
	 */
	@ApiProperty({
		description: 'Email пользователя',
		example: 'testuser1@gmail.com',
		maxLength: 200
	})
	@IsString({ message: UserStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: UserStrings.SHOULD_BE_NOT_EMPTY })
	@IsEmail({}, { message: UserStrings.SHOULD_BE_EMAIL })
	@MaxLength(200)
	email: string;

	/**
	 * Пароль
	 */
	@ApiProperty({
		description: 'Пароль пользователя',
		example: 'test1',
		maxLength: 200
	})
	@IsString({ message: UserStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: UserStrings.SHOULD_BE_NOT_EMPTY })
	@MaxLength(200)
	password: string;
}
