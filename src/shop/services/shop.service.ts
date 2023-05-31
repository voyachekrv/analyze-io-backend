import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ShopMapper } from '../mappers/shop.mapper';
import { PrismaService } from '../../prisma.service';
import { ShopFindManyParams } from '../shop.search-mapping';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopCardDto } from '../dto/shop.card.dto';
import { format } from 'util';
import { ShopStrings } from '../shop.strings';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { Shop, User } from '@prisma/client';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { DeleteDto } from '../../utils/delete.dto';

/**
 * Сервис для работы с магазинами
 */
@Injectable()
export class ShopService {
	/**
	 * Сервис для работы с магазинами
	 * @param prisma Подключение к Prisma
	 * @param shopMapper Маппер сущности Магазин
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly shopMapper: ShopMapper
	) {}

	/**
	 * Поиск всех магазинов
	 * @param params Параметры поиска
	 * @returns Страница со списком магазинов
	 */
	public async findAll(params: ShopFindManyParams): Promise<ShopItemDto[]> {
		Logger.log('finding all shops', this.constructor.name);

		return (await this.prisma.shop.findMany({ ...params })).map(
			this.shopMapper.toItemDto
		);
	}

	/**
	 * Поиск магазина по его ID
	 * @param shopId ID магазина
	 * @param showStaff Отображать ли сотрудников
	 * @returns Карточка магазина
	 */
	public async findById(
		id: number,
		showStaff: boolean
	): Promise<ShopCardDto> {
		Logger.log(`finding shop by id, id: ${id}`, this.constructor.name);

		const shop = await this.prisma.shop.findUnique({
			where: { id },
			include: {
				manager: true,
				employee: showStaff
			}
		});

		if (!shop) {
			throw new NotFoundException(
				format(
					ShopStrings.NOT_FOUND_SMTH,
					ShopStrings.SHOP_NOMINATIVE,
					id
				)
			);
		}

		const employee: User[] = [];

		if (shop.employee) {
			if (shop.employee.length > 0) {
				for (const e of shop.employee) {
					employee.push(
						await this.prisma.user.findUnique({
							where: { id: e.analystId }
						})
					);
				}
			}
		}

		return this.shopMapper.toCardDto(shop, shop.manager, employee);
	}

	/**
	 * Поиск сущности магазина по его ID
	 * @param managerId ID менеджера
	 * @param shopId ID магазина
	 * @returns Сущность Магазин
	 */
	public async findEntityById(managerId: number, id: number): Promise<Shop> {
		Logger.log(
			`finding shop entity by id, id: ${id}`,
			this.constructor.name
		);

		const shop = await this.prisma.shop.findFirst({
			where: {
				AND: [{ id }, { managerId }]
			}
		});

		if (!shop) {
			throw new NotFoundException(
				format(
					ShopStrings.NOT_FOUND_SMTH,
					ShopStrings.SHOP_NOMINATIVE,
					id
				)
			);
		}

		return shop;
	}

	/**
	 * Поиск магазина по его UUID
	 * @param shopId UUID магазина
	 * @param showStaff Отображать ли сотрудников
	 * @returns Карточка магазина
	 */
	public async findByUUID(
		uuid: string,
		showStaff: boolean
	): Promise<ShopCardDto> {
		Logger.log(
			`finding shop by uuid, uuid: ${uuid}`,
			this.constructor.name
		);

		const shop = await this.prisma.shop.findUnique({
			where: { uuid },
			include: {
				manager: true,
				employee: showStaff
			}
		});

		if (!shop) {
			throw new NotFoundException(
				format(
					ShopStrings.NOT_FOUND_SMTH,
					ShopStrings.SHOP_NOMINATIVE,
					uuid
				)
			);
		}

		return this.shopMapper.toCardDto(shop, shop.manager, []);
	}

	/**
	 * Поиск магазина по его ID и ID владельца для обновления
	 * @param managerId ID менеджера
	 * @param id ID магазина
	 * @returns Карточка пользователя для обновления
	 */
	public async findForUpdate(
		managerId: number,
		id: number
	): Promise<ShopUpdateDto> {
		Logger.log(
			`finding shop for update, id: ${id}, managerId: ${managerId}`,
			this.constructor.name
		);

		const shop = await this.prisma.shop.findFirst({
			where: {
				AND: [{ id }, { managerId }]
			}
		});

		if (!shop) {
			throw new NotFoundException(
				format(
					ShopStrings.NOT_FOUND_SMTH,
					ShopStrings.SHOP_NOMINATIVE,
					id
				)
			);
		}

		return this.shopMapper.toUpdateDto(shop);
	}

	/**
	 * Создание магазина
	 * @param managerId ID менеджера
	 * @param dto DTO создания магазина
	 * @returns ID нового магазина
	 */
	public async create(
		managerId: number,
		dto: ShopCreateDto
	): Promise<CreationResultDto> {
		Logger.log(
			`create shop, user: ${managerId}, name: ${dto.name}`,
			this.constructor.name
		);

		return new CreationResultDto(
			(
				await this.prisma.shop.create({
					data: this.shopMapper.create(dto, managerId)
				})
			).id
		);
	}

	/**
	 * Изменение магазина
	 * @param managerId ID менеджера
	 * @param id ID пользователя
	 * @param dto DTO изменения
	 * @returns DTO измененной сущности
	 */
	public async update(
		managerId: number,
		id: number,
		dto: ShopUpdateDto
	): Promise<ShopUpdateDto> {
		Logger.log(
			`update shop, manager: ${managerId}, id: ${id} name: ${dto.name}`,
			this.constructor.name
		);

		return this.shopMapper.toUpdateDto(
			await this.prisma.shop.update({
				data: this.shopMapper.update(dto),
				where: { id }
			})
		);
	}

	/**
	 * Удаление магазинов
	 * @param managerId ID менеджера
	 * @param dto ID сущностей для удаления
	 */
	public async remove(managerId: number, dto: DeleteDto): Promise<void> {
		Logger.log(
			`delete shops, user: ${managerId}, ids: ${dto.ids.join(', ')}`,
			this.constructor.name
		);

		await this.prisma.shop.deleteMany({
			where: {
				AND: [{ managerId }, { id: { in: dto.ids } }]
			}
		});
	}

	/**
	 * Проверака на магазин в подчинении у указанного менеджера
	 * @param managerId ID менеджера
	 * @param shopId ID магазина
	 * @returns Существует ли данный магазин в подчинении у указанного менеджера
	 */
	public async checkShopExisting(
		managerId: number,
		shopId: number
	): Promise<boolean> {
		const shop = await this.prisma.shop.findMany({
			where: {
				AND: [{ id: shopId }, { managerId }]
			}
		});

		if (shop.length === 0) {
			return false;
		}

		return true;
	}
}
