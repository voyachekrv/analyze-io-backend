import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../entities/user.entity';

/**
 * DTO для списка доступных ролей
 */
export class UserRolesDto {
	/**
	 * DTO для списка доступных ролей
	 * @param roles Список полученных ролей
	 */
	constructor(roles: string[]) {
		this.roles = roles;
	}

	/**
	 * Список полученных ролей
	 */
	@ApiProperty({
		description: 'Список ролей пользователя',
		example: [UserRoles.ROOT, UserRoles.USER],
		isArray: true,
		type: [String]
	})
	roles: string[];
}
