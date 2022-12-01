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
	id: number;

	/**
	 * Email
	 */
	email: string;
}
