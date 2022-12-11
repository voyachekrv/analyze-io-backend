import { Injectable } from '@nestjs/common';
import { DeleteDto } from '../../utils/delete.dto';
import { Page } from '../../utils/page';
import { UserCardDto } from '../dto/user.card.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRolesDto } from '../dto/user.roles.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UserRoles, User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';

/**
 * Сервис для работы с пользователями
 */
@Injectable()
export class UserService {
	/**
	 * Сервис для работы с пользователями
	 * @param userRepository Репозиторий сущности "Пользователь"
	 * @param jwtService JWT-сервис
	 * @param userMapper Маппер сущности "Пользователь"
	 * @param userVerifyService Сервис верификации пользователя
	 */
	constructor(
		private readonly userRepository: UserRepository,
		private readonly userMapper: UserMapper
	) {}

	/**
	 * Получение списка всех доступных ролей в системе
	 * @returns Возможные роли пользователя
	 */
	public getRoles(): UserRolesDto {
		return new UserRolesDto(Object.values(UserRoles));
	}

	/**
	 * Поиск всех пользователей
	 * @returns Список экземпляров DTO списка
	 */
	public async findAll(page: number): Promise<Page<UserItemDto>> {
		return (await this.userRepository.findAll(page)).map(
			this.userMapper.toItemDto
		) as Page<UserItemDto>;
	}

	/**
	 * Поиск пользователя по его ID
	 * @param id ID пользователя
	 * @returns Карточка пользователя
	 */
	public async findById(id: number): Promise<UserCardDto> {
		return this.userMapper.toCardDto(
			await this.userRepository.findOneOr404(id)
		);
	}

	/**
	 * Поиск пользователя для его обновления
	 * @param id ID пользователя
	 * @returns DTO обновления
	 */
	public async findForUpdate(id: number): Promise<UserUpdateDto> {
		return this.userMapper.toUpdateDto(
			await this.userRepository.findOneOr404(id)
		);
	}

	/**
	 * Поиск пользователя по email
	 * @param email Email пользователя
	 * @returns Найденная сущность
	 */
	public async findByEmail(email: string): Promise<User> {
		return await this.userRepository.findByEmail(email);
	}

	/**
	 * Создание пользователя
	 * @param dto DTO создания пользователя
	 * @param role Роль пользователя
	 * @returns Созаднный пользователь
	 */
	public async create(dto: UserCreateDto, role: UserRoles): Promise<User> {
		return await this.userRepository.save(
			this.userMapper.create(dto, role)
		);
	}

	/**
	 * Изменение пользователя
	 * @param id ID пользователя
	 * @param dto DTO изменения
	 * @returns ID измененной сущности
	 */
	public async update(
		id: number,
		dto: UserUpdateDto
	): Promise<UserUpdateDto> {
		return this.userMapper.toUpdateDto(
			await this.userRepository.save(
				await this.userMapper.update(dto, id)
			)
		);
	}

	/**
	 * Удаление пользователей
	 * @param dto ID сущностей для удаления
	 */
	public async remove(dto: DeleteDto): Promise<void> {
		await this.userRepository.deleteByIds(dto.ids);
	}
}
