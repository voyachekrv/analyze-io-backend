import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenInfoDto } from '../dto/token-info.dto';
import { UserRoles } from '../entities/user.entity';
import { UserStrings } from '../user.strings';

@Injectable()
export class UserVerifyService {
	constructor(private readonly jwtService: JwtService) {}

	public verifyUser(bearer: string): TokenInfoDto {
		const verifyResult = this.jwtService.verify(bearer);
		return {
			email: verifyResult.email,
			id: verifyResult.id,
			role: verifyResult.role
		};
	}

	public verifyUserAccess(id: number, bearer: string): void {
		const tokenInfo: TokenInfoDto = this.jwtService.verify(bearer);

		if (tokenInfo.role !== UserRoles.ROOT) {
			if (tokenInfo.id !== id) {
				throw new ForbiddenException(UserStrings.CANNOT_PERMITE);
			}
		}
	}
}
