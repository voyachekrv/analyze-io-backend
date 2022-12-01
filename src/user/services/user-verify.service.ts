import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenInfoDto } from '../dto/token-info.dto';
import { UserRoles } from '../entities/user.entity';
import { UserStrings } from '../user.strings';

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

	// ? Вынести в guard
	/**
	 * Проверка доступа пользователя к методам,
	 * которые он может выполнять исключительно над собственными данными
	 * @param id ID пользователя
	 * @param bearer Bearer-токен
	 */
	public verifyUserAccess(id: number, bearer: string): void {
		const tokenInfo: TokenInfoDto = this.jwtService.verify(bearer);

		if (tokenInfo.role !== UserRoles.ROOT) {
			if (tokenInfo.id !== id) {
				throw new ForbiddenException(UserStrings.CANNOT_PERMITE);
			}
		}
	}
}
