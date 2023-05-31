import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UserStrings } from '../../user.strings';

/**
 * Данные для создания пользователя
 */
export class UserCreateDto {
	/**
	 * Email
	 */
	@ApiProperty({
		description: 'Email пользователя',
		example: 'john@doe.com',
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
		example: 'qwerty',
		maxLength: 200
	})
	@IsString({ message: UserStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: UserStrings.SHOULD_BE_NOT_EMPTY })
	@MaxLength(200)
	password: string;

	/**
	 * Имя пользователя
	 */
	@ApiProperty({
		description: 'Имя пользователя',
		example: 'John Doe',
		maxLength: 300
	})
	@IsString({ message: UserStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: UserStrings.SHOULD_BE_NOT_EMPTY })
	@MaxLength(300)
	name: string;
}
