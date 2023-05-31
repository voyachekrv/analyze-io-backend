import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
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
	 * @param avatar Аватар
	 */
	constructor(
		id: number,
		email: string,
		name: string,
		role: UserRole,
		manager?: UserItemDto,
		avatar?: string
	) {
		this.id = id;
		this.email = email;
		this.name = name;
		this.role = role;

		if (manager) {
			this.manager = manager;
		}

		if (avatar) {
			this.avatar = avatar;
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
		example: UserRole.DATA_SCIENCE_MANAGER,
		enum: UserRole,
		enumName: 'UserRole'
	})
	role: UserRole;

	/**
	 * Менеджер аналитика
	 */
	@ApiProperty({
		description: 'Менеджер',
		example: UserItemDto,
		required: false
	})
	manager?: UserItemDto;

	/**
	 * Путь к аватару
	 */
	@ApiProperty({
		description: 'Путь к аватару',
		example: '/avatars/avatar.png',
		required: false
	})
	avatar?: string;
}
