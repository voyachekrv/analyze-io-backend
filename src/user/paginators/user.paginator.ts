import { NotFoundException } from '@nestjs/common';
import {
	PagePreparedData,
	Paginator,
	SearchConditions
} from '../../utils/paginator';
import { SelectQueryBuilder } from 'typeorm';

export interface UserSearchConditions extends SearchConditions {
	orderBy: {
		field: string;
		direction: 'ASC' | 'DESC';
	};
}

export class UserPaginator<T, C extends SearchConditions>
	// eslint-disable-next-line prettier/prettier
	implements Paginator<T, C> {
	private readonly ITEMS_PER_PAGE = 10;

	public async paginateQuery<T>(
		queryBuilder: SelectQueryBuilder<T>,
		searchConditions?: C
	): Promise<PagePreparedData<T>> {
		const listBuilder = queryBuilder;

		if (searchConditions.orderBy) {
			listBuilder.orderBy(
				searchConditions.orderBy.field,
				searchConditions.orderBy.direction
			);
		}

		const countTotal = await listBuilder.getCount();
		const lastPage = Math.floor(countTotal / this.ITEMS_PER_PAGE);

		if (lastPage < searchConditions.page) {
			throw new NotFoundException('This page is not exists');
		}

		listBuilder
			.limit(this.ITEMS_PER_PAGE)
			.offset(this.ITEMS_PER_PAGE * searchConditions.page);

		const [list, countOnPage] = await listBuilder.getManyAndCount();

		return {
			list,
			total: countTotal,
			totalOnPage: countOnPage,
			currentPage: searchConditions.page,
			lastPage
		};
	}
}
