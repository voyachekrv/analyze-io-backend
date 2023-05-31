import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Параметры поиска множества пользователей
 */
export type UserFindManyParams = {
	skip?: number;
	take?: number;
	cursor?: Prisma.UserWhereUniqueInput;
	where?: Prisma.UserWhereInput;
	orderBy?: Prisma.UserOrderByWithRelationInput;
};

/**
 * Создание объекта параметров поиска пользователя
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
): UserFindManyParams => {
	try {
		const result: UserFindManyParams = {};

		if (take) {
			result.take = Number(take);
		}

		if (skip) {
			result.skip = Number(skip);
		}

		if (where) {
			result.where = JSON.parse(where) as Prisma.UserWhereInput;
		}

		if (orderBy) {
			result.orderBy = JSON.parse(
				orderBy
			) as Prisma.UserOrderByWithRelationInput;
		}

		return result;
	} catch (e) {
		throw new BadRequestException('Некорректный формат параметров поиска');
	}
};
