import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { Shop } from '../entities/shop.entity';
import { ShopRepository } from '../repositories/shop.repository';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import { ShopPatchDto } from '../dto/shop.patch.dto';
import { UserMapper } from '../../user/mappers/user.mapper';
import { ShopChangeStaffResultDto } from '../dto/shop.change-staff.result.dto';
import { UserItemDto } from 'src/user/dto/user.item.dto';

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
		private readonly shopRepository: ShopRepository,
		private readonly userMapper: UserMapper
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
		if (entity.analytics !== undefined) {
			const staff: UserItemDto[] = [];

			entity.analytics.forEach(e => {
				staff.push(this.userMapper.toItemDto(e));
			});

			return new ShopCardDto(
				entity.id,
				entity.name,
				entity.uuid,
				this.userMapper.toItemDto(entity.user),
				staff
			);
		}

		return new ShopCardDto(
			entity.id,
			entity.name,
			entity.uuid,
			this.userMapper.toItemDto(entity.user)
		);
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
	 * Конвертация в DTO смены владельца
	 * @param entity Сущность Магазин
	 * @returns DTO результата смены владельца
	 */
	public toPatchResultDto(entity: Shop): ShopPatchDto {
		return new ShopPatchDto(
			this.toItemDto(entity),
			this.userMapper.toItemDto(entity.user)
		);
	}

	/**
	 * Конвертация в DTO результата операции изменения персонала
	 * @param entity Сущность Магазин
	 * @returns DTO результата операции изменения персонала
	 */
	public toChangeStaffResultDto(entity: Shop): ShopChangeStaffResultDto {
		const staff: UserItemDto[] = [];

		entity.analytics.forEach(e => {
			staff.push(this.userMapper.toItemDto(e));
		});

		return new ShopChangeStaffResultDto(entity, staff);
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
