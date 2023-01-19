import { ShopMapper } from '../mappers/shop.mapper';
import { ShopRepository } from '../repositories/shop.repository';
import { Injectable, Logger } from '@nestjs/common';
import { Page } from '../../utils/page';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { Shop } from '../entities/shop.entity';
import { DeleteDto } from '../../utils/delete.dto';

/**
 * Сервис для работы с пользователями
 */
@Injectable()
export class ShopService {
	constructor(
		private readonly shopRepository: ShopRepository,
		private readonly shopMapper: ShopMapper
	) {}

	/**
	 * Поиск всех магазинов пользователя
	 * @param userId ID пользователя
	 * @param page Номер страницы
	 * @returns Страница со списком магазинов
	 */
	public async findAll(
		userId: number,
		page: number
	): Promise<Page<ShopItemDto>> {
		Logger.log(
			`finding all shops, userId: ${userId} page: ${page}`,
			this.constructor.name
		);

		return (await this.shopRepository.findAll(userId, page)).map(
			this.shopMapper.toItemDto
		) as Page<ShopItemDto>;
	}

	/**
	 * Поиск магазина по его ID и ID владельца
	 * @param userId ID пользователя
	 * @param id ID магазина
	 * @returns Карточка магазина
	 */
	public async findById(userId: number, id: number): Promise<ShopCardDto> {
		Logger.log(
			`finding shop by id, id: ${id}, userId: ${userId}`,
			this.constructor.name
		);

		return this.shopMapper.toCardDto(
			await this.shopRepository.findByIdAndUserId(userId, id)
		);
	}

	/**
	 * Поиск магазина пользователя по UUID
	 * @param uuid UUID магазина
	 * @param userId ID пользователя
	 * @returns Карточка магазина
	 */
	public async findByUUID(
		uuid: string,
		userId: number
	): Promise<ShopCardDto> {
		Logger.log(
			`finding shop by uuid, uuid: ${uuid}, userId: ${userId}`,
			this.constructor.name
		);

		return this.shopMapper.toCardDto(
			await this.shopRepository.findByUUID(uuid, userId)
		);
	}

	/**
	 * Поиск магазина по его ID и ID владельца для обновления
	 * @param userId ID пользователя
	 * @param id ID магазина
	 * @returns Карточка пользователя для обновления
	 */
	public async findForUpdate(
		userId: number,
		id: number
	): Promise<ShopUpdateDto> {
		Logger.log(
			`finding shop for update, id: ${id}, userId: ${userId}`,
			this.constructor.name
		);

		return this.shopMapper.toCardDto(
			await this.shopRepository.findByIdAndUserId(userId, id)
		);
	}

	/**
	 * Создание магазина
	 * @param userId ID пользователя
	 * @param dto DTO создания магазина
	 */
	public async create(userId: number, dto: ShopCreateDto): Promise<Shop> {
		Logger.log(
			`create shop, user: ${userId}, name: ${dto.name}`,
			this.constructor.name
		);

		return await this.shopRepository.save(
			await this.shopMapper.create(dto, userId)
		);
	}

	/**
	 * Изменение пользователя
	 * @param userId ID пользователя
	 * @param id ID пользователя
	 * @param dto DTO изменения
	 * @returns ID измененной сущности
	 */
	public async update(
		userId: number,
		id: number,
		dto: ShopUpdateDto
	): Promise<ShopUpdateDto> {
		Logger.log(
			`update shop, user: ${userId}, id: ${id} name: ${dto.name}`,
			this.constructor.name
		);

		return this.shopMapper.toUpdateDto(
			await this.shopRepository.save(
				await this.shopMapper.update(dto, userId, id)
			)
		);
	}

	/**
	 * Удаление магазинов
	 * @param userId ID пользователя
	 * @param dto ID сущностей для удаления
	 */
	public async remove(userId: number, dto: DeleteDto): Promise<void> {
		Logger.log(
			`delete users, user: ${userId}, ids: ${dto.ids.join(', ')}`,
			this.constructor.name
		);

		await this.shopRepository.deleteByIds(userId, dto.ids);
	}
}
