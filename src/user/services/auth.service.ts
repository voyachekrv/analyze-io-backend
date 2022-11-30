import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '../dto/token.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserSignInDto } from '../dto/user.sign-in.dto';
import { User, UserRoles } from '../entities/user.entity';
import { UserStrings } from '../user.strings';
import { PasswordService } from './password.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly passwordService: PasswordService
	) {}

	public async login(dto: UserSignInDto): Promise<TokenDto> {
		return this.generateToken(await this.validateUser(dto));
	}

	public async register(dto: UserCreateDto): Promise<TokenDto> {
		const user = await this.userService.create(dto, UserRoles.USER);

		return this.generateToken(user);
	}

	private generateToken(user: User): TokenDto {
		return {
			token: this.jwtService.sign({
				email: user.email,
				id: user.id,
				role: user.role
			})
		};
	}

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
