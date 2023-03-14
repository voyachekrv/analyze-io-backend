import { Injectable, Logger } from '@nestjs/common';
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
	 * @param userMapper Маппер сущности "Пользователь"
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
		Logger.log('getting roles', this.constructor.name);
		return new UserRolesDto(Object.values(UserRoles));
	}

	/**
	 * Поиск всех пользователей
	 * @param page Номер страницы
	 * @returns Список экземпляров DTO списка
	 */
	public async findAll(page: number): Promise<Page<UserItemDto>> {
		Logger.log(`finding all users, page: ${page}`, this.constructor.name);

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
		Logger.log(`finding user by id, id: ${id}`, this.constructor.name);

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
		Logger.log(
			`finding user by id for update, id: ${id}`,
			this.constructor.name
		);

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
		Logger.log(
			`finding user by email, email: ${email}`,
			this.constructor.name
		);

		return await this.userRepository.findByEmail(email);
	}

	/**
	 * Создание пользователя
	 * @param dto DTO создания пользователя
	 * @param role Роль пользователя
	 * @returns Созаднный пользователь
	 */
	public async create(dto: UserCreateDto, role: UserRoles): Promise<User> {
		Logger.log(
			`create user, email: ${dto.email}, name: ${dto.name}, role: ${role}`,
			this.constructor.name
		);

		return await this.userRepository.save(
			this.userMapper.create(dto, role, null)
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
		Logger.log(
			`update user, id: ${id}, email: ${dto.email}, name: ${dto.name}`,
			this.constructor.name
		);

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
		Logger.log(
			`delete users, ids: ${dto.ids.join(', ')}`,
			this.constructor.name
		);

		await this.userRepository.deleteByIds(dto.ids);
	}
}
