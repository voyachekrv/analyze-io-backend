import { Logger, ForbiddenException } from '@nestjs/common';

/**
 * Извлечение из URL ID магазина
 * @param url URL
 * @returns ID магазина
 */
export const extractShopId = (url: string): number => {
	const shopId = (url as string).split('/').at(-2);
	const numberShopId = Number(shopId);

	if (isNaN(numberShopId)) {
		Logger.error(
			`shopId is ${shopId}, it is not a number`,
			extractShopId.name
		);
		throw new ForbiddenException(
			'Нет разрешения на осуществление операции'
		);
	}

	return numberShopId;
};
