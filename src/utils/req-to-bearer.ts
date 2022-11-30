import { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';

export const reqToBearer = (req: Request): string => {
	if (req.headers.authorization) {
		return req.headers.authorization.split(' ')[1];
	}

	throw new ForbiddenException();
};
