import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

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
		example: [UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST],
		isArray: true,
		type: [String]
	})
	roles: string[];
}
