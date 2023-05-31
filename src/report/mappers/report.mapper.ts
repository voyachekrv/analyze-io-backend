import { Injectable } from '@nestjs/common';
import { Prisma, Report, Shop, User } from '@prisma/client';
import { ShopMapper } from '../../shop/mappers/shop.mapper';
import { UserMapper } from '../../user/mappers/user.mapper';
import { ReportCardDto } from '../dto/report.card.dto';
import { ReportCreateDto } from '../dto/report.create.dto';
import { ReportItemDto } from '../dto/report.item.dto';
import { ReportUpdateDto } from '../dto/report.update.dto';

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
		private readonly userMapper: UserMapper
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
	 * @param creator  Создатель отчета
	 * @param shop Магазин, по которому был сделан отчет
	 * @returns DTO карточки
	 */
	public toCardDto(entity: Report, creator: User, shop: Shop): ReportCardDto {
		return new ReportCardDto({
			id: entity.id,
			createdAt: entity.createdAt,
			name: entity.name,
			file: entity.file,
			comment: entity.comment,
			seenByManager: entity.seenByManager,
			dataScientist: this.userMapper.toItemDto(creator),
			shop: this.shopMapper.toItemDto(shop)
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
		dataScientistId: number,
		shopId: number
	): Prisma.ReportCreateInput {
		return {
			name: dto.name,
			file: pathToFile,
			comment: dto.comment,
			creator: {
				connect: {
					id: dataScientistId
				}
			},
			shop: {
				connect: {
					id: shopId
				}
			}
		};
	}

	/**
	 * Обновление Отчета
	 * @param dto DTO обновления
	 * @returns Обновленная сущность Отчет
	 */
	public update(dto: ReportUpdateDto): unknown {
		return {
			name: dto.name,
			comment: dto.comment
		};
	}
}
