import { Injectable, Logger } from '@nestjs/common';
import { UserItemDto } from '../../user/dto/user.item.dto';
import { DataScientistQueriesRepository } from '../repositories/data-scientist-queries.repository';
import { UserMapper } from '../../user/mappers/user.mapper';
import { UserCardDto } from '../../user/dto/user.card.dto';
import { UserCreateDto } from '../../user/dto/user.create.dto';
import { User, UserRoles } from '../../user/entities/user.entity';
import { SubordinatePatchDto } from '../dto/subordinate.patch.dto';
import { DeleteDto } from '../../utils/delete.dto';
import { ManagerChangeResult } from '../types/manager-change-result.type';
import { DataScientistMapper } from '../mappers/data-scientist.mapper';

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
		private readonly userMapper: UserMapper,
		private readonly dataScientistMapper: DataScientistMapper
	) {}

	/**
	 * Получить всех аналитиков
	 * @param managerId ID менеджера
	 * @returns Список аналитиков
	 */
	public async findAll(managerId: number): Promise<UserItemDto[]> {
		Logger.log(
			`finding data scientists, managerID: ${managerId}`,
			this.constructor.name
		);

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
		Logger.log(
			`finding data scientist by ID, ID: ${userId} managerID: ${managerId}`,
			this.constructor.name
		);

		return this.userMapper.toCardDto(
			await this.dataScientistQueriesRepository.findOneOr404(
				managerId,
				userId
			)
		);
	}

	/**
	 * Создание нового аналитика
	 * @param dto DTO создания пользователя
	 * @param managerId ID менеджера
	 * @returns Новый пользователь
	 */
	public async create(dto: UserCreateDto, managerId: number): Promise<User> {
		Logger.log(
			`creating user data-scientist, dto: ${dto.email}, ${dto.name}, managerID: ${managerId}`,
			this.constructor.name
		);

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
	): Promise<ManagerChangeResult> {
		Logger.log(
			`change manager, old manager ID: ${managerId}, new manager ID: ${dto.managerId}, subordinates: ${dto.subordinates}`,
			this.constructor.name
		);

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

		const result = await this.dataScientistQueriesRepository.save(
			patchCandidates
		);

		result.forEach(entity => {
			Logger.log(
				`manager changed, old manager ID: ${managerId}, new manager ID: ${entity.manager.id}, subordinate: ${entity.id}`,
				this.constructor.name
			);
		});

		return this.dataScientistMapper.toPatchResultDto(result);
	}

	/**
	 * Удаление аналитиков
	 * @param managerId ID менеджера
	 * @param dto ID сущностей для удаления
	 */
	public async remove(managerId: number, dto: DeleteDto): Promise<void> {
		Logger.log(
			`delete data scientists, manager: ${managerId}, ids: ${dto.ids.join(
				', '
			)}`,
			this.constructor.name
		);

		await this.dataScientistQueriesRepository.deleteByIds(
			managerId,
			dto.ids
		);
	}
}
