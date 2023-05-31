import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ShopChangeStaffDto } from '../dto/shop-change-staff.dto';
import { AnalystsOnShop } from '@prisma/client';
import { ShopService } from './shop.service';
import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopChangeStaffOperation } from '../enums/shop-change-staff-operation.enum';
import { ShopChangeManagerResultDto } from '../dto/shop-change-manager-result.dto';
import { ShopChangeManagerDto } from '../dto/shop-change-manager.dto';
import { UserService } from '../../user/services/user.service';
import { ShopStrings } from '../shop.strings';

/**
 * Сервис для работы с персоналом магазина
 */
@Injectable()
export class ShopStaffService {
	/**
	 * Сервис для работы с персоналом магазина
	 * @param prisma Подключение к Prisma
	 * @param shopService Сервис магазина
	 * @param userService Сервис пользователя
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly shopService: ShopService,
		private readonly userService: UserService
	) {}

	/**
	 * Смена состава сотрудников магазина
	 * @param shopId ID магазина
	 * @param operation Операция с сотрудниками
	 * @param dto DTO операции с сотрудниками
	 * @returns Карточка магазина
	 */
	public async changeStaff(
		shopId: number,
		operation: ShopChangeStaffOperation,
		dto: ShopChangeStaffDto
	): Promise<ShopCardDto> {
		return await this[`${operation}Staff`](shopId, dto);
	}

	/**
	 * Смена менеджера магазина
	 * @param shopId ID магазина
	 * @param dto Данные для смены менеджера магазина
	 * @param Результат замены менеджера на магазине
	 */
	public async changeShopManager(
		shopId: number,
		dto: ShopChangeManagerDto
	): Promise<ShopChangeManagerResultDto> {
		Logger.log(
			`change shop manager, shop: ${shopId}, new manager: ${dto.managerId}`,
			this.constructor.name
		);

		await this.prisma.$transaction([
			this.prisma.user.updateMany({
				data: { managerId: dto.managerId },
				where: {
					shopsAsEmployee: {
						some: {
							shopId
						}
					}
				}
			}),
			this.prisma.shop.update({
				data: { managerId: dto.managerId },
				where: { id: shopId }
			})
		]);

		return new ShopChangeManagerResultDto(
			(
				await this.shopService.findAll({
					where: { id: shopId },
					take: 1
				})
			)[0],
			(
				await this.userService.findAll({
					where: { id: dto.managerId },
					take: 1
				})
			)[0]
		);
	}

	/**
	 * Добавление персонала в магазин
	 * @param shopId ID магазина
	 * @param dto DTO операции с сотрудниками
	 * @returns Обновленные сведения о магазине
	 */
	private async addStaff(
		shopId: number,
		dto: ShopChangeStaffDto
	): Promise<ShopCardDto> {
		Logger.log(
			`add staff to shop, id: ${shopId}, staff: ${dto.dataScientistIds}`,
			this.constructor.name
		);

		const staffExists = await this.checkStaffInShop(shopId, dto);

		if (staffExists) {
			throw new ForbiddenException(ShopStrings.EMPLOYEE_AT_SHOP_YET);
		}

		await this.prisma.analystsOnShop.createMany({
			data: this.prepareStaffInsert(shopId, dto)
		});

		return await this.shopService.findById(shopId, true);
	}

	/**
	 * Удаление персонала из магазина
	 * @param shopId ID магазина
	 * @param dto DTO операции с сотрудниками
	 * @returns Обновленные сведения о магазине
	 */
	private async removeStaff(
		shopId: number,
		dto: ShopChangeStaffDto
	): Promise<ShopCardDto> {
		Logger.log(
			`remove staff from shop, id: ${shopId}, staff: ${dto.dataScientistIds}`,
			this.constructor.name
		);

		const staffExists = await this.checkStaffInShop(shopId, dto);

		if (!staffExists) {
			throw new ForbiddenException(ShopStrings.EMPLOYEE_NOT_AT_SHOP);
		}

		await this.prisma.analystsOnShop.deleteMany({
			where: {
				AND: [{ shopId }, { analystId: { in: dto.dataScientistIds } }]
			}
		});

		return await this.shopService.findById(shopId, true);
	}

	/**
	 * Проверка на наличие заданных сотрудников в магазине
	 * @param shopId ID магазина
	 * @param dto DTO с ID сотрудников
	 * @returns Работают ли сотрудники в магазине
	 */
	private async checkStaffInShop(
		shopId: number,
		dto: ShopChangeStaffDto
	): Promise<boolean> {
		const existingStaff = await this.prisma.analystsOnShop.findMany({
			where: {
				AND: [{ shopId }, { analystId: { in: dto.dataScientistIds } }]
			}
		});

		if (existingStaff.length > 0) {
			return true;
		}
		return false;
	}

	/**
	 * Подготовка массива сущностей "Аналитики к магазину" для вставки
	 * @param shopId ID магазина
	 * @param dto DTO с ID сотрудников для назначения на магазин
	 * @returns Сущности "Аналитики к магазину"
	 */
	private prepareStaffInsert(
		shopId: number,
		dto: ShopChangeStaffDto
	): AnalystsOnShop[] {
		const insertData: AnalystsOnShop[] = [];

		dto.dataScientistIds.forEach(id => {
			insertData.push({ shopId, analystId: id });
		});

		return insertData;
	}
}
