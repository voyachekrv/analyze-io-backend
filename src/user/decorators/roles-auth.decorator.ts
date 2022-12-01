import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Роли, для которых доступен вызов эндпоинта
 * @param roles Роли пользователя
 * @returns void
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
