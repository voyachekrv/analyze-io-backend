import { CommerceStrings } from '../commerce.strings';
import { Shop } from '../entities/shop.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from '../../utils/page';
import { Repository } from 'typeorm';
import { format } from 'util';
import {
	ShopPaginator,
	ShopSearchConditions
} from '../paginators/shop.paginator';

/**
 * Репозиторий для сущности "Магазин"
 */
@Injectable()
export class ShopRepository extends Repository<Shop> {
	/**
	 * Репозиторий для сущности "Магазин"
	 * @param repository Репозиторий
	 */
	constructor(
		@InjectRepository(Shop)
		repository: Repository<Shop>
	) {
		super(repository.target, repository.manager, repository.queryRunner);
	}

	/**
	 * Найти все магазины по ID пользователя
	 * @param userId ID пользователя
	 * @param page Номер страницы
	 * @returns Страница сущностей
	 */
	public async findAll(userId: number, page: number): Promise<Page<Shop>> {
		return new Page(
			await new ShopPaginator<Shop, ShopSearchConditions>(
				userId
			).paginateQuery(this.createQueryBuilder('shop'), {
				page,
				orderBy: {
					field: 'id',
					direction: 'ASC'
				}
			})
		);
	}

	/**
	 * Удаление списка сущностей "Пользователь"
	 * @param userId ID пользователя
	 * @param ids ID пользователей для удаления
	 */
	public async deleteByIds(userId: number, ids: number[]): Promise<void> {
		await this.createQueryBuilder('shop')
			.delete()
			.from(Shop)
			.whereInIds(ids)
			.andWhere('shop.user_id = :userId', { userId })
			.execute();
	}

	/**
	 * Получение сущности "Магазин" по id
	 * @param id ID сущности
	 * @returns Найденная сущность
	 */
	public async findById(id: number): Promise<Shop> {
		// eslint-disable-next-line prettier/prettier
		return await this.createQueryBuilder('shop')
			.where({ id })
			.getOne();
	}

	/**
	 * Получение сущности "Магазин" по id и идентификатору пользователя
	 * @param userId ID пользователя
	 * @param id ID сущности
	 * @returns Найденная сущность
	 */
	public async findByIdAndUserId(userId: number, id: number): Promise<Shop> {
		return await this.createQueryBuilder('shop')
			.where({ id })
			.andWhere('shop.user_id = :userId', { userId })
			.getOne();
	}

	/**
	 * Получение сущности "Магазин" по его ID
	 * или возврат ошибки 404 в случае, если сущность не найдена
	 * @param userId ID пользователя
	 * @param id ID записи
	 * @returns Сущность "Магазин"
	 */
	public async findOneOr404(userId: number, id: number): Promise<Shop> {
		// eslint-disable-next-line prettier/prettier
		const entity = await this.createQueryBuilder('shop')
			.where({ id })
			.andWhere('shop.user_id = :userId', { userId })
			.getOne();

		if (!entity) {
			throw new NotFoundException(
				format(
					CommerceStrings.NOT_FOUND_SMTH,
					CommerceStrings.SHOP_GENERATIVE,
					id
				)
			);
		}

		return entity;
	}
}
