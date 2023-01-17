import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { Shop } from '../entities/shop.entity';
import { ShopRepository } from '../repositories/shop.repository';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';

/**
 * Маппер для сущности Магазин
 */
@Injectable()
export class ShopMapper {
	/**
	 * Маппер для сущности Магазин
	 * @param userReoository Репозиторий сущности "Пользователь"
	 * @param shopRepository Репозиторий сущности "Магазин"
	 */
	constructor(
		private readonly userReoository: UserRepository,
		private readonly shopRepository: ShopRepository
	) {}

	/**
	 * Создание DTO списка
	 * @param entity Сущность Магазин
	 * @returns DTO списка
	 */
	public toItemDto(entity: Shop): ShopItemDto {
		return new ShopItemDto(entity.id, entity.name);
	}

	/**
	 * Создание DTO карточки
	 * @param entity Сущность Магазин
	 * @returns DTO карточки
	 */
	public toCardDto(entity: Shop): ShopCardDto {
		return new ShopCardDto(entity.id, entity.name, entity.uuid);
	}

	/**
	 * Создание DTO обновления
	 * @param entity Сущность Магазин
	 * @returns DTO обновления
	 */
	public toUpdateDto(entity: Shop): ShopUpdateDto {
		return new ShopUpdateDto(entity.name);
	}

	/**
	 * Создание новой сущности Магазин
	 * @param dto DTO создания
	 * @param userId ID пользователя
	 * @returns Новая сущность Магазин
	 */
	public async create(dto: ShopCreateDto, userId: number): Promise<Shop> {
		return new Shop(dto.name, await this.userReoository.findById(userId));
	}

	/**
	 * Обновление сущности Магазин
	 * @param dto DTO обновления
	 * @param id ID магазина
	 * @returns Обновленная сущность Магазин
	 */
	public async update(
		dto: ShopUpdateDto,
		userId: number,
		id: number
	): Promise<Shop> {
		const entity = await this.shopRepository.findByIdAndUserId(userId, id);
		entity.name = dto.name;

		return entity;
	}
}
