import { ApiProperty } from '@nestjs/swagger';

/**
 * Данные пользоателя, полученные для вывода в списке
 */
export class UserItemDto {
	/**
	 * Данные пользоателя, полученные для вывода в списке
	 * @param id ID пользователя
	 * @param email Email
	 */
	constructor(id: number, email: string) {
		this.id = id;
		this.email = email;
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
}
