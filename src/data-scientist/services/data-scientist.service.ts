import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DataScientistMapper } from '../mappers/data-scientist.mapper';
import { UserMapper } from '../../user/mappers/user.mapper';
import { UserCreateDto } from '../../user/dto/user/user.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { User, UserRole } from '@prisma/client';
import { DeleteDto } from '../../utils/delete.dto';
import { SubordinateChangeManagerDto } from '../dto/subordinate-change-manager.dto';
import { ManagerChangeResult } from '../types/manager-change-result.type';

/**
 * Сервис для работы с аналитиками
 */
@Injectable()
export class DataScientistService {
	/**
	 * Сервис для работы с аналитиками
	 * @param prisma Подключение к Prisma
	 * @param dataScientistMapper Маппер сущности "Пользователь" подвида "Аналитик"
	 * @param userMapper Маппер сущности "Пользователь"
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly dataScientistMapper: DataScientistMapper,
		private readonly userMapper: UserMapper
	) {}

	/**
	 * Создание нового аналитика
	 * @param dto DTO создания пользователя
	 * @param managerId ID менеджера
	 * @returns Новый пользователь
	 */
	public async create(
		dto: UserCreateDto,
		managerId: number
	): Promise<CreationResultDto> {
		Logger.log(
			`creating user data-scientist, dto: ${dto.email}, ${dto.name}, managerID: ${managerId}`,
			this.constructor.name
		);

		const dataScientist = await this.prisma.user.create({
			data: this.userMapper.create(
				dto,
				UserRole.DATA_SCIENTIST,
				managerId
			)
		});

		return new CreationResultDto(dataScientist.id);
	}

	/**
	 * Смена менеджера у аналитиков
	 * @param managerId ID старого менеджера
	 * @param dto Данные для смены менеджера
	 * @returns Результат смены менеджера
	 */
	public async changeManager(
		managerId: number,
		dto: SubordinateChangeManagerDto
	): Promise<ManagerChangeResult> {
		Logger.log(
			`change manager, old manager ID: ${managerId}, new manager ID: ${dto.managerId}, subordinates: ${dto.subordinates}`,
			this.constructor.name
		);

		const patchCandidates = await this.filterAlienDataScientists(
			managerId,
			dto.subordinates
		);

		if (patchCandidates.length > 0) {
			await this.fireFromAllShops(patchCandidates);

			await this.prisma.user.updateMany({
				data: {
					managerId: dto.managerId
				},
				where: {
					AND: [
						{ id: { in: dto.subordinates } },
						{ role: UserRole.DATA_SCIENTIST }
					]
				}
			});
		}

		return this.dataScientistMapper.toSubordinateChangeManagerResultDto(
			await this.prisma.user.findMany({
				where: { id: { in: dto.subordinates } }
			}),
			await this.prisma.user.findUnique({ where: { id: dto.managerId } })
		);
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

		await this.prisma.user.deleteMany({
			where: {
				AND: [
					{ id: { in: dto.ids } },
					{ managerId },
					{ role: UserRole.DATA_SCIENTIST }
				]
			}
		});
	}

	/**
	 * Получить список аналитиков, в подчинении у заданного менеджера
	 * @param managerId ID менеджера
	 * @param dataScientistsIds ID аналитиков
	 * @returns Список аналитиков
	 */
	private async getDataScientisisByIds(
		managerId: number,
		dataScientistsIds: number[]
	): Promise<User[]> {
		return await this.prisma.user.findMany({
			where: {
				AND: [{ id: { in: dataScientistsIds } }, { managerId }]
			}
		});
	}

	/**
	 * Уволить аналитиков со всех магазинов, на которых они работают
	 * @param dataScientistsIds ID аналитиков
	 */
	private async fireFromAllShops(dataScientistsIds: number[]): Promise<void> {
		await this.prisma.analystsOnShop.deleteMany({
			where: {
				AND: [{ analystId: { in: dataScientistsIds } }]
			}
		});
	}

	/**
	 * Поиск ID аналитиков по заданным ID менеджера и ID аналитиков
	 * @param managerId ID менеджера
	 * @param dataScientistsIds ID аналитиков
	 * @returns Список ID аналитиков
	 */
	private async filterAlienDataScientists(
		managerId: number,
		dataScientistsIds: number[]
	): Promise<number[]> {
		return (
			await this.getDataScientisisByIds(managerId, dataScientistsIds)
		).map(e => e.id);
	}
}
