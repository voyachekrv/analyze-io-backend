import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DeleteDto } from 'src/utils/delete.dto';
import { format } from 'util';
import { TokenInfoDto } from '../dto/token-info.dto';
import { UserCardDto } from '../dto/user.card.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRolesDto } from '../dto/user.roles.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UserRoles, User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { UserStrings } from '../user.strings';
import { UserVerifyService } from './user-verify.service';

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
		private readonly jwtService: JwtService,
		private readonly userMapper: UserMapper,
		private readonly userVerifyService: UserVerifyService
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
	public async findAll(): Promise<UserItemDto[]> {
		return (await this.userRepository.find()).map(entity =>
			this.userMapper.toItemDto(entity)
		);
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
	 * @param token Токен авторизации
	 * @returns DTO обновления
	 */
	public async findForUpdate(
		id: number,
		token: string
	): Promise<UserUpdateDto> {
		this.userVerifyService.verifyUserAccess(id, token);

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
		await this.verifyUniqueEmailOnCreate(dto.email);

		return await this.userRepository.save(
			this.userMapper.create(dto, role)
		);
	}

	/**
	 * Изменение пользователя
	 * @param id ID пользователя
	 * @param dto DTO изменения
	 * @param token Bearer-токен
	 * @returns ID измененной сущности
	 */
	public async update(
		id: number,
		dto: UserUpdateDto,
		token: string
	): Promise<User> {
		this.userVerifyService.verifyUserAccess(id, token);
		await this.verifyUniqueEmailOnUpdate(id, dto.email);

		return await this.userRepository.update(
			await this.userMapper.update(dto, id)
		);
	}

	/**
	 * Удаление пользователей
	 * @param dto ID сущностей для удаления
	 * @param token Bearer-токен
	 */
	public async remove(dto: DeleteDto, token: string): Promise<void> {
		this.verifyUserDelete(token, dto.ids);

		await this.userRepository.deleteByIds(dto.ids);
	}

	// ? Вынести в guard
	/**
	 * Подтверждение уникальности email при создании пользователя
	 * @param email Email
	 */
	private async verifyUniqueEmailOnCreate(email: string): Promise<void> {
		if (await this.userRepository.findByEmail(email)) {
			throw new BadRequestException(
				format(
					UserStrings.ALREADY_EXISTS_EMAIL,
					UserStrings.USER_NOMINATIVE,
					email
				)
			);
		}
	}

	// ? Вынести в guard
	/**
	 * Проверка наличия email в базе данных у пользователя под другим идентификатором
	 * @param id ID пользователя
	 * @param email Email пользователя
	 */
	private async verifyUniqueEmailOnUpdate(
		id: number,
		email: string
	): Promise<void> {
		const user = await this.userRepository.findByEmail(email);

		if (user) {
			if (user.id !== id && user.email === email) {
				throw new BadRequestException(
					format(
						UserStrings.ALREADY_EXISTS_EMAIL,
						UserStrings.USER_NOMINATIVE,
						email
					)
				);
			}
		}
	}

	// ? Вынести в guard
	/**
	 * Проверка на возможность удаления обычным пользователем аккаунтов других пользоватеей
	 * @param bearer Токен пользователя
	 * @param ids Идентификаторы удаляемых пользователей
	 */
	private verifyUserDelete(bearer: string, ids: number[]): void {
		const user: TokenInfoDto = this.jwtService.verify(bearer);

		if (user.role !== UserRoles.ROOT) {
			if (!ids.includes(user.id) || ids.length > 1) {
				throw new ForbiddenException(
					UserStrings.CANNOT_DELETE_THIS_USER
				);
			}
		}
	}
}
