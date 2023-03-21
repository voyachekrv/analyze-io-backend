import { Injectable } from '@nestjs/common';
import { UserCardDto } from '../dto/user.card.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { User, UserRoles } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from '../services/password.service';
import { ShopItemDto } from '../../commerce/dto/shop.item.dto';

/**
 * Маппер сущности "Пользователь"
 */
@Injectable()
export class UserMapper {
	/**
	 * Маппер сущности "Пользователь"
	 * @param passwordService Сервис работы с паролем
	 */
	constructor(
		private passwordService: PasswordService,
		private readonly userRepository: UserRepository
	) {}

	/**
	 * Конвертация сущности в DTO списка
	 * @param entity Сущность
	 * @returns DTO списка
	 */
	public toItemDto(entity: User): UserItemDto {
		return new UserItemDto(entity.id, entity.email, entity.name);
	}

	/**
	 * Конвертация сущности в DTO карточки
	 * @param entity Сущность
	 * @returns DTO карточки
	 */
	public toCardDto(entity: User): UserCardDto {
		const dto = new UserCardDto(
			entity.id,
			entity.email,
			entity.name,
			entity.role
		);

		if (entity.manager) {
			dto.manager = this.toItemDto(entity.manager);
		}

		const shops: ShopItemDto[] = [];

		if (entity.shops) {
			entity.shops.forEach(e => {
				shops.push(new ShopItemDto(e.id, e.name));
			});
		}

		dto.shops = shops;

		return dto;
	}

	/**
	 * Конвертация сущности в DTO обновления
	 * @param entity Сущность
	 * @returns DTO обновления
	 */
	public toUpdateDto(entity: User): UserUpdateDto {
		return new UserUpdateDto(
			entity.email,
			this.passwordService.decrypt(entity.password),
			entity.name
		);
	}

	/**
	 * Конвертация DTO создания в сущность
	 * @param dto DTO создания пользователя
	 * @param role Роль пользователя
	 * @returns Сущность "пользователь" (пароль зашифрован)
	 */
	public create(dto: UserCreateDto, role: UserRoles, manager?: User): User {
		return new User(
			dto.email,
			this.passwordService.encrypt(dto.password),
			dto.name,
			manager,
			role
		);
	}

	/**
	 * Конвертация DTO обновления в сущность
	 * @param dto DTO обновления пользователя
	 * @param id ID пользователя
	 * @returns Сущность "пользователь" (пароль зашифрован)
	 */
	public async update(dto: UserUpdateDto, id: number): Promise<User> {
		const entity = await this.userRepository.findById(id);

		entity.email = dto.email;
		entity.password = this.passwordService.encrypt(dto.password);
		entity.name = dto.name;

		return entity;
	}
}
