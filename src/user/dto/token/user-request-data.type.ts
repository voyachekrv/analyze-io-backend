import { TokenInfoDto } from './token-info.dto';

/**
 * Информация о пользователе, извлекаемая из JWT-токена
 */
export type UserRequestData = TokenInfoDto & { iat: number; exp: string };
