import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../decorators/roles-auth.decorator';
import { TokenInfoDto } from '../dto/token-info.dto';
import { TokenDto } from '../dto/token.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserSignInDto } from '../dto/user.sign-in.dto';
import { UserRoles } from '../entities/user.entity';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../services/auth.service';

/**
 * Контроллер авторизации пользователя
 */
@Controller('user/auth')
@ApiTags('Авторизация пользователя')
@ApiBearerAuth()
export class AuthController {
	/**
	 * Контроллер авторизации пользователя
	 * @param authService Сервис авторизации пользователя
	 * @param userVerifyService Сервис верификации пользователя
	 */
	constructor(private readonly authService: AuthService) {}

	/**
	 * Авторизация пользователя
	 * @param dto DTO авторизации
	 * @returns Токен авторизации
	 */
	@Post('/login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Авторизация пользователя'
	})
	@ApiResponse({
		type: TokenDto,
		description: 'Токен авторизации',
		status: 200
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized'
	})
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
	@ApiOperation({
		summary: 'Регистрация пользователя'
	})
	@ApiResponse({
		type: TokenDto,
		description: 'Токен авторизации',
		status: 201
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
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
	@ApiOperation({
		summary: 'Возврат информации о зарегистрированном пользователе'
	})
	@ApiResponse({
		type: TokenInfoDto,
		description: 'Токен авторизации',
		status: 200
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public whois(@Req() request: Request): TokenInfoDto {
		return new TokenInfoDto(
			request['user'].id,
			request['user'].email,
			request['user'].role
		);
	}
}
