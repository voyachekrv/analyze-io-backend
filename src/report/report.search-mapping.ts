import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReportStrings } from './report.strings';

/**
 * Параметры поиска множества отчетов
 */
export type ReportFindManyParams = {
	skip?: number;
	take?: number;
	cursor?: Prisma.ShopWhereUniqueInput;
	where?: Prisma.ShopWhereInput;
	orderBy?: Prisma.ShopOrderByWithRelationInput;
};

/**
 * Создание объекта параметров поиска отчета
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
): ReportFindManyParams => {
	try {
		const result: ReportFindManyParams = {};

		if (take) {
			result.take = Number(take);
		}

		if (skip) {
			result.skip = Number(skip);
		}

		if (where) {
			result.where = JSON.parse(where) as Prisma.ReportWhereInput;
		}

		if (orderBy) {
			result.orderBy = JSON.parse(
				orderBy
			) as Prisma.ReportOrderByWithRelationInput;
		}

		return result;
	} catch (e) {
		throw new BadRequestException(ReportStrings.BAD_SEARCH_PARAMS_FORMAT);
	}
};
