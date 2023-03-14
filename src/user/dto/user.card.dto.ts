import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../entities/user.entity';
import { UserItemDto } from './user.item.dto';

/**
 * Информация для отображения карточки пользователя
 */
export class UserCardDto {
	/**
	 * Информация для отображения карточки пользователя
	 * @param id ID пользователя
	 * @param email Email
	 * @param name Имя пользователя
	 * @param role Роль
	 * @param manager Менеджер (у аналитика)
	 */
	constructor(
		id: number,
		email: string,
		name: string,
		role: UserRoles,
		manager?: UserItemDto
	) {
		this.id = id;
		this.email = email;
		this.name = name;
		this.role = role;

		if (manager) {
			this.manager = manager;
		}
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
	 * Имя пользователя
	 */
	@ApiProperty({ description: 'Имя пользователя', example: 'John Doe' })
	name: string;

	/**
	 * Роль
	 */
	@ApiProperty({
		description: 'Роль пользователя',
		example: UserRoles.DATA_SCIENCE_MANAGER,
		enum: UserRoles,
		enumName: 'UserRoles'
	})
	role: UserRoles;

	/**
	 * Менеджер аналитика
	 */
	@ApiProperty({ description: 'Менеджер', example: UserItemDto })
	manager?: UserItemDto;
}
