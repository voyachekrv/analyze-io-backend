import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { format } from 'util';
import { TokenInfoDto } from '../dto/token-info.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRoles, User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { UserStrings } from '../user.strings';

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
	 */
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
		private readonly userMapper: UserMapper
	) {}

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
	 * Поиск пользователя по email
	 * @param email Email пользователя
	 * @returns Список экземпляров DTO списка
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
