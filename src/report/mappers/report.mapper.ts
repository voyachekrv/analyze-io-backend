import { Injectable } from '@nestjs/common';
import { ShopMapper } from '../../commerce/mappers/shop.mapper';
import { UserMapper } from '../../user/mappers/user.mapper';
import { ReportItemDto } from '../dto/report.item.dto';
import { Report } from '../entities/report.entity';
import { ReportCardDto } from '../dto/report.card.dto';
import { ReportUpdateDto } from '../dto/report.update.dto';
import { ReportCreateDto } from '../dto/report.create.dto';
import { Shop } from '../../commerce/entities/shop.entity';
import { User } from '../../user/entities/user.entity';
import { ReportRepository } from '../repositories/report.repository';

/**
 * Маппер для сущности Отчет
 */
@Injectable()
export class ReportMapper {
	/**
	 * Маппер для сущности отчет
	 * @param shopMapper Маппер сущности Магазин
	 * @param userMapper Маппер сущности Пользователь
	 * @param reportRepository Репозиторий сущности Магазин
	 */
	constructor(
		private readonly shopMapper: ShopMapper,
		private readonly userMapper: UserMapper,
		private readonly reportRepository: ReportRepository
	) {}

	/**
	 * Конвертация сущности в DTO списка
	 * @param entity Сущность отчет
	 * @returns DTO списка
	 */
	public toItemDto(entity: Report): ReportItemDto {
		return new ReportItemDto(
			entity.id,
			entity.createdAt,
			entity.name,
			entity.seenByManager
		);
	}

	/**
	 * Конвертация сущности в DTO карточки
	 * @param entity Сущность Отчет
	 * @returns DTO карточки
	 */
	public toCardDto(entity: Report): ReportCardDto {
		return new ReportCardDto({
			id: entity.id,
			createdAt: entity.createdAt,
			name: entity.name,
			file: entity.file,
			comment: entity.comment,
			seenByManager: entity.seenByManager,
			dataScientist: this.userMapper.toItemDto(entity.dataScientist),
			shop: this.shopMapper.toItemDto(entity.shop)
		});
	}

	/**
	 * Конвертация сущности в DTO обновления
	 * @param entity Сущность Отчет
	 * @returns DTO обновления
	 */
	public toUpdateDto(entity: Report): ReportUpdateDto {
		return new ReportUpdateDto(entity.name, entity.comment);
	}

	/**
	 * Создание сущности Отчет
	 * @param dto DTO создания сущности
	 * @param pathToFile Путь к файлу отчета
	 * @param dataScientist Аналитик - создатель файла
	 * @param shop Магазин
	 * @returns Сущность Отчет
	 */
	public create(
		dto: ReportCreateDto,
		pathToFile: string,
		dataScientist: User,
		shop: Shop
	): Report {
		return new Report(
			dto.name,
			pathToFile,
			dto.comment,
			dataScientist,
			shop
		);
	}

	/**
	 * Обновление Отчета
	 * @param dto DTO обновления
	 * @param shopId ID магазина
	 * @param id ID отчета
	 * @returns Обновленная сущность Отчет
	 */
	public async update(
		dto: ReportUpdateDto,
		shopId: number,
		id: number
	): Promise<Report> {
		const entity = await this.reportRepository.findById(shopId, id);

		entity.name = dto.name;
		entity.comment = dto.comment;

		return entity;
	}
}
