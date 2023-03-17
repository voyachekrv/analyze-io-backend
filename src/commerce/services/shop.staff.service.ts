import { Injectable, Logger, MethodNotAllowedException } from '@nestjs/common';
import { DataScientistQueriesRepository } from '../../data-scientist/repositories/data-scientist-queries.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { DataSource } from 'typeorm';
import { ShopMapper } from '../mappers/shop.mapper';
import { ShopRepository } from '../repositories/shop.repository';
import { User } from '../../user/entities/user.entity';
import { EntityArrayUtils } from '../../utils/entity-array-utils';
import { ShopPatchDto } from '../dto/shop.patch.dto';
import { Shop } from '../entities/shop.entity';
import { ShopChangeStaffOperation } from '../enums/shop-change-staff-operation';
import { ShopCardDto } from '../dto/shop.card.dto';

@Injectable()
export class ShopStaffService {
	constructor(
		private readonly shopRepository: ShopRepository,
		private readonly userRepository: UserRepository,
		private readonly dataScientistRepository: DataScientistQueriesRepository,
		private readonly shopMapper: ShopMapper,
		private readonly dataSource: DataSource
	) {}

	/**
	 * Переподчинение аналитиков другому менеджеру
	 * @param dataScientists Аналитики
	 * @param newManager Новый менеджер аналитики
	 */
	private async changeDataScientistManager(
		dataScientists: User[],
		newManager: User
	): Promise<void> {
		const updatedEntities: User[] = dataScientists;

		updatedEntities.forEach(dataScientist => {
			Logger.log(
				`changed manager to user, userId: ${dataScientist.id}, new manager id: ${newManager.id}`
			);
			dataScientist.manager = newManager;
			dataScientist.shops = [];
		});

		await this.userRepository.save(updatedEntities);
	}

	/**
	 * Смена владельца магазина
	 * @param userId ID текущего владельца
	 * @param id ID магазина
	 * @param newOwnerId ID нового владельца магазина
	 * @returns Результат смены владельца
	 */
	public async changeOwner(
		userId: number,
		id: number,
		newOwnerId: number
	): Promise<ShopPatchDto> {
		if (userId === newOwnerId) {
			throw new MethodNotAllowedException(
				'Данный пользователь уже является менеджером текущего магазина'
			);
		}

		const shop = await this.shopRepository.findByIdWithStaff(userId, id);

		const queryRunner = await this.dataSource.createQueryRunner();
		await queryRunner.startTransaction();

		try {
			await queryRunner.query(`
				DELETE FROM usr.user_shops_shop WHERE "userId" IN (${shop.analytics
					.map(e => e.id)
					.join(', ')});
			`);
			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
		} finally {
			await queryRunner.release();
		}

		await this.dataScientistRepository.save(shop.analytics);

		const newOwner = await this.userRepository.findById(newOwnerId);

		shop.user = newOwner;

		if (shop.analytics.length > 0) {
			await this.changeDataScientistManager(shop.analytics, newOwner);
		}

		shop.analytics = [];

		return this.shopMapper.toPatchResultDto(
			await this.shopRepository.save(shop)
		);
	}

	/**
	 * Добавление аналитиков в магазин
	 * @param shop Магазин
	 * @param dataScientists Список добавляемых аналитиков
	 * @returns Обновленный магазин
	 */
	private async addDataScientists(
		shop: Shop,
		dataScientists: User[]
	): Promise<ShopCardDto> {
		let shopAnalyticsUserInsert =
			'INSERT INTO commerce.shop_analytics_user ("shopId", "userId") VALUES ';

		let userShopsShopSql =
			'INSERT INTO usr.user_shops_shop ("userId", "shopId") VALUES ';

		if (!shop.analytics) {
			shop.analytics = [];
		}

		for (let i = 0; i < dataScientists.length; i++) {
			if (!dataScientists[i].shops) {
				dataScientists[i].shops = [];
			}

			if (
				EntityArrayUtils.exists<User>(
					shop.analytics,
					dataScientists[i].id
				) ||
				EntityArrayUtils.exists<Shop>(dataScientists[i].shops, shop.id)
			) {
				throw new MethodNotAllowedException(
					`Работник с id: ${dataScientists[i].id} уже работает на выбранном магазине с id ${shop.id}`
				);
			} else {
				shopAnalyticsUserInsert += `(${shop.id}, ${dataScientists[i].id})`;
				userShopsShopSql += `(${dataScientists[i].id}, ${shop.id})`;

				if (i + 1 === dataScientists.length) {
					shopAnalyticsUserInsert += ';';
					userShopsShopSql += ';';
				} else {
					shopAnalyticsUserInsert += ', ';
					userShopsShopSql += ', ';
				}
			}
		}

		const queryRunner = await this.dataSource.createQueryRunner();
		await queryRunner.startTransaction();

		try {
			await queryRunner.query(shopAnalyticsUserInsert);
			await queryRunner.query(userShopsShopSql);
			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
		} finally {
			await queryRunner.release();
		}

		const updatedShop = await this.shopRepository.findByIdWithStaff(
			shop.user.id,
			shop.id
		);

		return this.shopMapper.toCardDto(updatedShop);
	}

	/**
	 * Удаление аналитиков из магазина
	 * @param shop Магазин
	 * @param dataScientists Список удаляемых аналитиков
	 * @returns Обновленный магазин
	 */
	private async removeDataScientists(
		shop: Shop,
		dataScientists: User[]
	): Promise<ShopCardDto> {
		const shopAnalyticsUserDeleteSql = `DELETE FROM commerce.shop_analytics_user WHERE "shopId" = ${
			shop.id
		} AND "userId" IN (${dataScientists.map(e => e.id).join(', ')})`;

		const userShopsShopDeleteSql = `DELETE FROM usr.user_shops_shop WHERE "userId" IN (${dataScientists
			.map(e => e.id)
			.join(', ')}) AND "shopId" = ${shop.id}`;

		dataScientists.forEach(element => {
			if (
				!EntityArrayUtils.exists<User>(shop.analytics, element.id) ||
				!EntityArrayUtils.exists<Shop>(element.shops, shop.id)
			) {
				throw new MethodNotAllowedException(
					`Работник с id: ${element.id} не работает на выбранном магазине с id ${shop.id}`
				);
			}
		});

		const queryRunner = await this.dataSource.createQueryRunner();
		await queryRunner.startTransaction();

		try {
			await queryRunner.query(shopAnalyticsUserDeleteSql);
			await queryRunner.query(userShopsShopDeleteSql);
			await queryRunner.commitTransaction();
		} catch (error) {
			await queryRunner.rollbackTransaction();
		} finally {
			await queryRunner.release();
		}

		const updatedShop = await this.shopRepository.findByIdWithStaff(
			shop.user.id,
			shop.id
		);

		return this.shopMapper.toCardDto(updatedShop);
	}

	/**
	 * Обновление персонала магазина
	 * @param id ID магазина
	 * @param userId ID владельца магазина
	 * @param dataScientistsIds ID добавляемых / удаляемых аналитиков
	 * @param operation Операция - добавление или удаление
	 * @returns Обновленный магазин
	 */
	public async changeDataScientists(
		id: number,
		userId: number,
		dataScientistsIds: number[],
		operation: ShopChangeStaffOperation
	): Promise<ShopCardDto> {
		const dataScientists = await this.dataScientistRepository.findAllByIds(
			userId,
			dataScientistsIds
		);

		const shop = await this.shopRepository.findByIdWithStaff(userId, id);

		let result: ShopCardDto;

		if (operation === ShopChangeStaffOperation.add) {
			result = await this.addDataScientists(shop, dataScientists);
		}

		if (operation === ShopChangeStaffOperation.remove) {
			result = await this.removeDataScientists(shop, dataScientists);
		}

		return result;
	}
}
