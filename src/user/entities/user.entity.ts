/**
 * Роли пользователя
 */
export enum UserRoles {
	/**
	 * Пользователь без привилегий суперпользователя
	 */
	USER = 'USER',
	/**
	 * Суперпользователь
	 */
	ROOT = 'ROOT'
}

/**
 * Сущность - пользователь
 */
export class User {
	constructor(email: string, password: string, role?: UserRoles) {
		this.email = email;
		this.password = password;

		if (role) {
			this.role = role;
		}
	}

	/**
	 * ID пользователя
	 */
	id: number;

	/**
	 * Email
	 */
	email: string;

	/**
	 * Пароль
	 */
	password: string;

	/**
	 * Роль
	 */
	role: UserRoles;
}
