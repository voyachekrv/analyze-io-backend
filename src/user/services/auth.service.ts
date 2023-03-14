import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '../dto/token.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserSignInDto } from '../dto/user.sign-in.dto';
import { User, UserRoles } from '../entities/user.entity';
import { UserStrings } from '../user.strings';
import { PasswordService } from './password.service';
import { UserService } from './user.service';

/**
 * Сервис аутентификации пользователя
 */
@Injectable()
export class AuthService {
	/**
	 * Сервис аутентификации пользователя
	 * @param userService Сервис работы с пользователями
	 * @param jwtService JWT-сервис
	 * @param passwordService Сервис для работы с паролем
	 */
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly passwordService: PasswordService
	) {}

	/**
	 * Авторизация пользователя
	 * @param dto DTO авторизации
	 * @returns Bearer-токен
	 */
	public async login(dto: UserSignInDto): Promise<TokenDto> {
		Logger.log(
			`login, dto: {email: ${dto.email}, password: ${dto.password}}`,
			this.constructor.name
		);
		return this.generateToken(await this.validateUser(dto));
	}

	/**
	 * Регистрация пользователя
	 * @param dto DTO создания
	 * @returns Bearer-токен
	 */
	public async register(dto: UserCreateDto): Promise<TokenDto> {
		const user = await this.userService.create(
			dto,
			UserRoles.DATA_SCIENCE_MANAGER
		);

		Logger.log(
			`registered user, id: ${user.id}, role: ${user.role}`,
			this.constructor.name
		);

		return this.generateToken(user);
	}

	/**
	 * Генерация токена авторизации на основе сущности Пользователя
	 * @param user Пользователь
	 * @returns DTO Bearer-токена
	 */
	private generateToken(user: User): TokenDto {
		Logger.log(
			`token generation, id: ${user.id}, role: ${user.role}, ${user.email}`,
			this.constructor.name
		);

		return {
			token: this.jwtService.sign({
				email: user.email,
				id: user.id,
				role: user.role
			})
		};
	}

	/**
	 * Проверка правильности введенных данных авторизации
	 * @param dto DTO авторизации
	 * @returns Найденная сущность на основе введенных email и пароля
	 */
	private async validateUser(dto: UserSignInDto): Promise<User> {
		const user = await this.userService.findByEmail(dto.email);

		if (!user) {
			throw new UnauthorizedException(UserStrings.BAD_CREDENTIALS);
		}

		if (
			this.passwordService.decrypt(user.password) === dto.password &&
			user.email === dto.email
		) {
			if (user.email === dto.email) {
				return user;
			}
		} else {
			throw new UnauthorizedException(UserStrings.BAD_CREDENTIALS);
		}
	}
}
