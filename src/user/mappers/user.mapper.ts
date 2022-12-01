import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { User, UserRoles } from '../entities/user.entity';
import { PasswordService } from '../services/password.service';

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
		return new UserItemDto(entity.id, entity.email);
	}

	/**
	 * Конвертация DTO создания в сущность
	 * @param dto DTO создания пользователя
	 * @param role Роль пользователя
	 * @returns Сущность "пользователь" (пароль зашифрован)
	 */
	public create(dto: UserCreateDto, role: UserRoles): User {
		return new User(
			dto.email,
			this.passwordService.encrypt(dto.password),
			role
		);
	}
}
