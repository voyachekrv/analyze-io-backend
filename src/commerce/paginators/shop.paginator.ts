import { SelectQueryBuilder } from 'typeorm';
import {
	PagePreparedData,
	Paginator,
	SearchConditions
} from '../../utils/paginator';
import { NotFoundException } from '@nestjs/common';

export interface ShopSearchConditions extends SearchConditions {
	orderBy: {
		field: string;
		direction: 'ASC' | 'DESC';
	};
}

export class ShopPaginator<T, C extends SearchConditions>
	// eslint-disable-next-line prettier/prettier
implements Paginator<T, C> {
	private readonly ITEMS_PER_PAGE = 10;

	private userId: number;

	constructor(userId: number) {
		this.userId = userId;
	}

	public async paginateQuery<T>(
		queryBuilder: SelectQueryBuilder<T>,
		searchConditions?: C
	): Promise<PagePreparedData<T>> {
		const listBuilder = queryBuilder;

		listBuilder.where('shop.user_id = :userId', { userId: this.userId });

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
