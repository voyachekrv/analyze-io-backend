import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserMapper } from '../mappers/user.mapper';
import { UserRolesDto } from '../dto/user/user.roles.dto';
import { User, UserRole } from '@prisma/client';
import { UserItemDto } from '../dto/user/user.item.dto';
import { UserCardDto } from '../dto/user/user.card.dto';
import { PrismaService } from '../../prisma.service';
import { UserUpdateDto } from '../dto/user/user.update.dto';
import { UserCreateDto } from '../dto/user/user.create.dto';
import { DeleteDto } from '../../utils/delete.dto';
import { UserFindManyParams } from '../user.search-mapping';
import { format } from 'util';
import { UserStrings } from '../user.strings';

/**
 * Сервис для работы с пользователями
 */
@Injectable()
export class UserService {
	/**
	 * Сервис для работы с пользователями
	 * @param prisma Подключение к Prisma
	 * @param userMapper Маппер сущности "Пользователь"
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly userMapper: UserMapper
	) {}

	/**
	 * Получение списка всех доступных ролей в системе
	 * @returns Возможные роли пользователя
	 */
	public getRoles(): UserRolesDto {
		Logger.log('getting roles', this.constructor.name);
		return new UserRolesDto(Object.values(UserRole));
	}

	/**
	 * Поиск всех пользователей
	 * @param params Параметры поиска (take, skip, where, orderBy)
	 * @returns Список экземпляров DTO списка
	 */
	public async findAll(params: UserFindManyParams): Promise<UserItemDto[]> {
		Logger.log('finding all users', this.constructor.name);

		return (await this.prisma.user.findMany({ ...params })).map(
			this.userMapper.toItemDto
		);
	}

	/**
	 * Поиск пользователя по его ID
	 * @param id ID пользователя
	 * @returns Карточка пользователя
	 */
	public async findById(id: number): Promise<UserCardDto> {
		Logger.log(`finding user by id, id: ${id}`, this.constructor.name);

		try {
			const entity = await this.prisma.user.findUniqueOrThrow({
				where: { id },
				include: { manager: true }
			});

			return this.userMapper.toCardDto(entity, entity.manager);
		} catch (e) {
			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_NOMINATIVE,
					id
				)
			);
		}
	}

	/**
	 * Поиск сущности пользователя по ID
	 * @param id ID пользователя
	 * @returns Сущность пользователя
	 */
	public async findEntityById(id: number): Promise<User> {
		Logger.log(
			`finding user entity by id, id: ${id}`,
			this.constructor.name
		);

		try {
			const entity = await this.prisma.user.findUniqueOrThrow({
				where: { id }
			});

			return entity;
		} catch (e) {
			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_NOMINATIVE,
					id
				)
			);
		}
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

		try {
			return this.userMapper.toUpdateDto(
				await this.prisma.user.findUniqueOrThrow({
					where: { id }
				})
			);
		} catch (e) {
			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_NOMINATIVE,
					id
				)
			);
		}
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

		return await this.prisma.user.findUnique({ where: { email } });
	}

	/**
	 * Создание пользователя
	 * @param dto DTO создания пользователя
	 * @param role Роль пользователя
	 * @param managerId ID менеджера
	 * @returns Созаднный пользователь
	 */
	public async create(
		dto: UserCreateDto,
		role: UserRole,
		managerId?: number
	): Promise<User> {
		return await this.prisma.user.create({
			data: this.userMapper.create(dto, role, managerId)
		});
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

		try {
			return this.userMapper.toUpdateDto(
				await this.prisma.user.update({
					where: { id },
					data: this.userMapper.update(dto)
				})
			);
		} catch (e) {
			console.log(e);

			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_NOMINATIVE,
					id
				)
			);
		}
	}

	/**
	 * Проверка на то, является ли пользователь менеджером
	 * @param id ID пользователя
	 * @returns Является ли пользователь менеджером
	 */
	public async checkManager(id: number): Promise<boolean> {
		Logger.log(`manager checking ID: ${id}`, this.constructor.name);

		try {
			const entity = await this.prisma.user.findUniqueOrThrow({
				where: { id }
			});

			if (entity.role === UserRole.DATA_SCIENCE_MANAGER) {
				return true;
			}

			return false;
		} catch (e) {
			return false;
		}
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

		await this.prisma.user.deleteMany({
			where: {
				id: { in: dto.ids }
			}
		});
	}
}
