import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ShopStrings } from './shop.strings';

/**
 * Параметры поиска множества магазинов
 */
export type ShopFindManyParams = {
	skip?: number;
	take?: number;
	cursor?: Prisma.ShopWhereUniqueInput;
	where?: Prisma.ShopWhereInput;
	orderBy?: Prisma.ShopOrderByWithRelationInput;
};

/**
 * Создание объекта параметров поиска магазина
 * @param take Количество записей для взятия
 * @param skip Количество записей для пропуска
 * @param where Where-запрос в формате Prisma
 * @param orderBy OrderBy-запрос в формате Prisma
 * @returns Объект параметров поиска
 */
export const mapQueryToFindParams = (
	take?: number,
	skip?: number,
	where?: string,
	orderBy?: string
): ShopFindManyParams => {
	try {
		const result: ShopFindManyParams = {};

		if (take) {
			result.take = Number(take);
		}

		if (skip) {
			result.skip = Number(skip);
		}

		if (where) {
			result.where = JSON.parse(where) as Prisma.ShopWhereInput;
		}

		if (orderBy) {
			result.orderBy = JSON.parse(
				orderBy
			) as Prisma.ShopOrderByWithRelationInput;
		}

		return result;
	} catch (e) {
		throw new BadRequestException(ShopStrings.BAD_SEARCH_PARAMS_FORMAT);
	}
};
