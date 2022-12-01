import {
	Body,
	Controller,
	HttpCode,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { Roles } from '../decorators/roles-auth.decorator';
import { TokenInfoDto } from '../dto/token-info.dto';
import { TokenDto } from '../dto/token.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserSignInDto } from '../dto/user.sign-in.dto';
import { UserRoles } from '../entities/user.entity';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../services/auth.service';
import { UserVerifyService } from '../services/user-verify.service';

/**
 * Контроллер авторизации пользователя
 */
@Controller('user/auth')
export class AuthController {
	/**
	 * Контроллер авторизации пользователя
	 * @param authService Сервис авторизации пользователя
	 * @param userVerifyService Сервис верификации пользователя
	 */
	constructor(
		private readonly authService: AuthService,
		private readonly userVerifyService: UserVerifyService
	) {}

	/**
	 * Авторизация пользователя
	 * @param dto DTO авторизации
	 * @returns Токен авторизации
	 */
	@Post('/login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	public async login(@Body() dto: UserSignInDto): Promise<TokenDto> {
		return await this.authService.login(dto);
	}

	/**
	 * Регистрация пользователя
	 * @param dto DTO создания пользователя
	 * @returns Регистрация пользователя и его Токен авторизации
	 */
	@Post('/registration')
	@UsePipes(new ValidationPipe())
	public async registration(@Body() dto: UserCreateDto): Promise<TokenDto> {
		return await this.authService.register(dto);
	}

	/**
	 * Возврат информации о зарегистрированном пользователе
	 * @param dto DTO токена
	 * @returns Информации о зарегистрированном пользователе
	 */
	@Post('/whois')
	@HttpCode(200)
	@UseGuards(RolesGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	public whois(@Body() dto: TokenDto): TokenInfoDto {
		return this.userVerifyService.verifyUser(dto.token);
	}
}
