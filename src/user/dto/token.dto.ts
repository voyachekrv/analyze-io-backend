import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { UserStrings } from '../user.strings';

/**
 * Токен авторизации
 */
export class TokenDto {
	/**
	 * Значение токена авторизации
	 */
	@ApiProperty({
		description: 'Bearer-токен',
		// eslint-disable-next-line quotes
		example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
	})
	@IsString({ message: UserStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: UserStrings.SHOULD_BE_NOT_EMPTY })
	@IsJWT({ message: UserStrings.SHOULD_BE_JWT })
	token: string;
}
