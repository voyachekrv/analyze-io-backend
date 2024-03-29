import { ApiProperty } from '@nestjs/swagger';

/**
 * Данные пользоателя, полученные для вывода в списке
 */
export class UserItemDto {
	/**
	 * Данные пользоателя, полученные для вывода в списке
	 * @param id ID пользователя
	 * @param email Email
	 * @param name Имя пользователя
	 * @param avatar Аватар пользователя
	 */
	constructor(id: number, email: string, name: string, avatar?: string) {
		this.id = id;
		this.email = email;
		this.name = name;

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
	 * Путь к аватару
	 */
	@ApiProperty({
		description: 'Путь к аватару',
		example: 'resources/avatars/avatar.png',
		required: false
	})
	avatar?: string;
}
