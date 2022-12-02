import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../entities/user.entity';

/**
 * Информация для отображения карточки пользователя
 */
export class UserCardDto {
	/**
	 * Информация для отображения карточки пользователя
	 * @param id ID пользователя
	 * @param email Email
	 * @param role Роль
	 */
	constructor(id: number, email: string, role: UserRoles) {
		this.id = id;
		this.email = email;
		this.role = role;
	}

	/**
	 * ID пользователя
	 */
	@ApiProperty({ description: 'ID пользователя', example: 123 })
	id: number;

	/**
	 * Email
	 */
	@ApiProperty({ description: 'Email пользователя', example: 'john@doe.com' })
	email: string;

	/**
	 * Роль
	 */
	@ApiProperty({
		description: 'Роль пользователя',
		example: UserRoles.USER,
		enum: UserRoles,
		enumName: 'UserRoles'
	})
	role: UserRoles;
}
