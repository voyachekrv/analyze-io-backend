import { Injectable } from '@nestjs/common';
import { PasswordService } from '../services/password.service';
import { UserItemDto } from '../dto/user/user.item.dto';
import { Prisma, User, UserRole } from '@prisma/client';
import { UserCardDto } from '../dto/user/user.card.dto';
import { UserUpdateDto } from '../dto/user/user.update.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';

/**
 * Маппер сущности "Пользователь"
 */
@Injectable()
export class UserMapper {
	/**
	 * Маппер сущности "Пользователь"
	 * @param passwordService Сервис работы с паролем
	 */
	constructor(private passwordService: PasswordService) {}

	/**
	 * Конвертация сущности в DTO списка
	 * @param entity Сущность
	 * @returns DTO списка
	 */
	public toItemDto(entity: User): UserItemDto {
		return new UserItemDto(
			entity.id,
			entity.email,
			entity.name,
			entity.avatar
		);
	}

	/**
	 * Конвертация сущности в DTO карточки
	 * @param entity Сущность
	 * @param manager Пользователь-менеджер
	 * @returns DTO карточки
	 */
	public toCardDto(entity: User, manager: User): UserCardDto {
		const dto = new UserCardDto(
			entity.id,
			entity.email,
			entity.name,
			entity.role
		);

		if (entity.avatar) {
			dto.avatar = entity.avatar;
		}

		if (manager) {
			dto.manager = this.toItemDto(manager);
		}

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
	 * @param managerId ID менеджера пользователя
	 * @returns Сущность "пользователь" (пароль зашифрован)
	 */
	public create(
		dto: UserCreateDto,
		role: UserRole,
		managerId?: number
	): Prisma.UserCreateInput {
		const entity = {
			email: dto.email,
			password: this.passwordService.encrypt(dto.password),
			name: dto.name,
			role,
			managerId
		};

		return entity;
	}

	/**
	 * Конвертация DTO обновления в сущность
	 * @param dto DTO обновления пользователя
	 * @returns Сущность "пользователь" (пароль зашифрован)
	 */
	public update(dto: UserUpdateDto): unknown {
		return {
			email: dto.email,
			password: this.passwordService.encrypt(dto.password),
			name: dto.name
		};
	}
}
