/**
 * Строки для модуля Пользователей
 */
export enum UserStrings {
	BAD_CREDENTIALS = 'Некорректный email или пароль',
	NOT_FOUND_SMTH = '%s с ID = %d не существует',
	USER_GENERATIVE = 'Пользователя',
	USER_NOMINATIVE = 'Пользователь',
	NOT_FOUND_EMAIL = '%s с email = %s не существует',
	ALREADY_EXISTS_EMAIL = '%s с email = %s уже существует',
	CANNOT_DELETE_THIS_USER = 'Вы не можете удалить этого пользователя',
	CANNOT_PERMITE = 'У вас нет доступа для осуществления данной операции',
	SHOULD_BE_STRING = 'Поле должно быть строкой',
	SHOULD_BE_NOT_EMPTY = 'Строка в данном поле не должна быть пустой',
	SHOULD_BE_EMAIL = 'Некорректная запись email-адреса',
	SHOULD_BE_JWT = 'Токен должен быть JWT-токеном',
	UNAUTHORIZED_USER = 'Пользователь не был авторизирован',
	FORBIDDEN = 'Нет разрешения на осуществление операции'
}
