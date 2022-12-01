import { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';

/**
 * Получение Bearer-токена из request
 * @param req HTTP Request
 * @returns Bearer-токен
 */
export const reqToBearer = (req: Request): string => {
	if (req.headers.authorization) {
		return req.headers.authorization.split(' ')[1];
	}

	throw new ForbiddenException();
};
