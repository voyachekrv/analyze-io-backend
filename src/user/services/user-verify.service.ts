import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenInfoDto } from '../dto/token-info.dto';

/**
 * Сервис работы с подтверждением пользователя и его доступа
 */
@Injectable()
export class UserVerifyService {
	/**
	 * Сервис работы с подтверждением пользователя и его доступа
	 * @param jwtService JWT-сервис
	 */
	constructor(private readonly jwtService: JwtService) {}

	/**
	 * Получение данных о пользователе на основе его токена авторизации
	 * @param bearer Bearer-токен
	 * @returns DTO данных о пользователе
	 */
	public verifyUser(bearer: string): TokenInfoDto {
		const verifyResult = this.jwtService.verify(bearer);
		return {
			email: verifyResult.email,
			id: verifyResult.id,
			role: verifyResult.role
		};
	}
}
