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

@Controller('user/auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userVerifyService: UserVerifyService
	) {}

	@Post('/login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	public async login(@Body() dto: UserSignInDto): Promise<TokenDto> {
		return await this.authService.login(dto);
	}

	@Post('/registration')
	@UsePipes(new ValidationPipe())
	public async registration(@Body() dto: UserCreateDto): Promise<TokenDto> {
		return await this.authService.register(dto);
	}

	@Post('/whois')
	@HttpCode(200)
	@UseGuards(RolesGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	public whois(@Body() dto: TokenDto): TokenInfoDto {
		return this.userVerifyService.verifyUser(dto.token);
	}
}
