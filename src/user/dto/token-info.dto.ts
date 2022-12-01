/**
 * Данные, извлекаемые из токена авторизации
 */
export interface TokenInfoDto {
	/**
	 * ID пользователя
	 */
	id: number;

	/**
	 * Email
	 */
	email: string;

	/**
	 * Роль пользователя
	 */
	role: string;
}
