import { Injectable } from '@nestjs/common';
import { UserMapper } from '../../user/mappers/user.mapper';
import { Prisma, Shop, User } from '@prisma/client';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { uuid } from 'uuidv4';
import { UserItemDto } from '../../user/dto/user/user.item.dto';

/**
 * Маппер для сущности Магазин
 */
@Injectable()
export class ShopMapper {
	/**
	 * Маппер для сущности Магазин
	 * @param userMapper Маппер сущности "Пользователь"
	 */
	constructor(private readonly userMapper: UserMapper) {}

	/**
	 * Создание DTO списка
	 * @param entity Сущность Магазин
	 * @returns DTO списка
	 */
	public toItemDto(entity: Shop): ShopItemDto {
		return new ShopItemDto(entity.id, entity.name, entity.avatar);
	}

	/**
	 * Создание DTO карточки
	 * @param entity Сущность Магазин
	 * @param owner Менеджер по аналитике
	 * @param staff Персонал - аналитики
	 * @returns DTO карточки
	 */
	public toCardDto(entity: Shop, owner: User, staff: User[]): ShopCardDto {
		const staffDto: UserItemDto[] = [];

		if (staff.length > 0) {
			staff.forEach(e => {
				staffDto.push(this.userMapper.toItemDto(e));
			});
		}

		const dto = new ShopCardDto(
			entity.id,
			entity.name,
			entity.uuid,
			this.userMapper.toItemDto(owner),
			entity.avatar,
			staffDto
		);

		return dto;
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
	 * @param managerId ID пользователя
	 * @returns Новая сущность Магазин
	 */
	public create(
		dto: ShopCreateDto,
		managerId: number
	): Prisma.ShopCreateInput {
		return {
			uuid: uuid(),
			name: dto.name,
			manager: {
				connect: {
					id: managerId
				}
			}
		};
	}

	/**
	 * Обновление сущности Магазин
	 * @param dto DTO обновления
	 * @returns Обновленная сущность Магазин
	 */
	public update(dto: ShopUpdateDto): unknown {
		return {
			name: dto.name
		};
	}
}
