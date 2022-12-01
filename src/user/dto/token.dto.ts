import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

/**
 * Токен авторизации
 */
export class TokenDto {
	/**
	 * Значение токена авторизации
	 */
	@IsString({ message: 'Should be string' })
	@IsNotEmpty({ message: 'Should be not empty' })
	@IsJWT({ message: 'Token should be JWT-like' })
	token: string;
}
