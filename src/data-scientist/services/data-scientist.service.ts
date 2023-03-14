import { Injectable } from '@nestjs/common';
import { UserItemDto } from '../../user/dto/user.item.dto';
import { DataScientistQueriesRepository } from '../repositories/data-scientist-queries.repository';
import { UserMapper } from '../../user/mappers/user.mapper';
import { UserCardDto } from '../../user/dto/user.card.dto';
import { UserCreateDto } from '../../user/dto/user.create.dto';
import { User, UserRoles } from '../../user/entities/user.entity';
import { SubordinatePatchDto } from '../dto/subordinate.patch.dto';
import { DeleteDto } from '../../utils/delete.dto';

/**
 * Сервис для работы с аналитиками
 */
@Injectable()
export class DataScientistService {
	/**
	 * Сервис для работы с аналитиками
	 * @param dataScientistQueriesRepository Репозиторий для запросов к аналитикам
	 * @param userMapper Маппер сущности "Пользователь"
	 */
	constructor(
		private readonly dataScientistQueriesRepository: DataScientistQueriesRepository,
		private readonly userMapper: UserMapper
	) {}

	/**
	 * Получить всех аналитиков
	 * @param managerId ID менеджера
	 * @returns Список аналитиков
	 */
	public async findAll(managerId: number): Promise<UserItemDto[]> {
		return (
			await this.dataScientistQueriesRepository.findAll(managerId)
		).map(entity => this.userMapper.toItemDto(entity));
	}

	/**
	 * Получить аналитика по его ID
	 * @param managerId ID менеджера
	 * @param userId ID аналитика
	 * @returns Аналитик
	 */
	public async findById(
		managerId: number,
		userId: number
	): Promise<UserCardDto> {
		return this.userMapper.toCardDto(
			await this.dataScientistQueriesRepository.findOneOr404(
				managerId,
				userId
			)
		);
	}

	/**
	 * Проверка на то, является ли пользователь менеджером
	 * @param id ID пользователя
	 * @returns Является ли пользователь менеджером
	 */
	public async checkManager(id: number): Promise<boolean> {
		return await this.dataScientistQueriesRepository.isManager(id);
	}

	/**
	 * Создание нового аналитика
	 * @param dto DTO создания пользователя
	 * @param managerId ID менеджера
	 * @returns Новый пользователь
	 */
	public async create(dto: UserCreateDto, managerId: number): Promise<User> {
		const manager =
			await this.dataScientistQueriesRepository.findManagerOr404(
				managerId
			);

		return await this.dataScientistQueriesRepository.save(
			this.userMapper.create(dto, UserRoles.DATA_SCIENTIST, manager)
		);
	}

	/**
	 * Смена менеджера у аналитиков
	 * @param managerId ID старого менеджера
	 * @param dto Данные для смены менеджера
	 */
	public async changeManager(
		managerId: number,
		dto: SubordinatePatchDto
	): Promise<void> {
		const patchCandidates =
			await this.dataScientistQueriesRepository.findAllByIds(
				managerId,
				dto.subordinates
			);

		if (patchCandidates.length > 0) {
			const newManager =
				await this.dataScientistQueriesRepository.findManagerOr404(
					dto.managerId
				);

			patchCandidates.forEach(candidate => {
				candidate.manager = newManager;
			});
		}

		await this.dataScientistQueriesRepository.save(patchCandidates);

		// TODO: Сделать DTO для вывода результата patch метода
	}

	/**
	 * Удаление аналитиков
	 * @param managerId ID менеджера
	 * @param dto ID сущностей для удаления
	 */
	public async remove(managerId: number, dto: DeleteDto): Promise<void> {
		await this.dataScientistQueriesRepository.deleteByIds(
			managerId,
			dto.ids
		);
	}
}
