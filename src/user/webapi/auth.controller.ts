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
import { AuthService } from '../services/auth.service';
import { TokenDto } from '../dto/token/token.dto';
import { UserSignInDto } from '../dto/user/user.sign-in.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles-auth.decorator';
import { TokenInfoDto } from '../dto/token/token-info.dto';
import { UserRole } from '@prisma/client';

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
	 */
	constructor(private readonly authService: AuthService) {}

	@Post('login')
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

	@Post('registration')
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

	@Post('whoami')
	@HttpCode(200)
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENTIST, UserRole.DATA_SCIENCE_MANAGER)
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
	public whoAmI(@Req() request: Request): TokenInfoDto {
		return new TokenInfoDto(
			request['user'].id,
			request['user'].email,
			request['user'].role
		);
	}
}
