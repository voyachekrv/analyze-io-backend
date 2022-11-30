import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
	@IsString({ message: 'Should be string' })
	@IsNotEmpty({ message: 'Should be not empty' })
	@IsJWT({ message: 'Token should be JWT-like' })
	token: string;
}
