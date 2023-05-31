import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReportPayloadService } from './report-payload.service';
import { ReportMapper } from '../mappers/report.mapper';
import { PrismaService } from '../../prisma.service';
import { ReportItemDto } from '../dto/report.item.dto';
import { ReportFindManyParams } from '../report.search-mapping';
import { ReportCardDto } from '../dto/report.card.dto';
import { format } from 'util';
import { ReportStrings } from '../report.strings';
import { ReportUpdateDto } from '../dto/report.update.dto';
import { ReportCreateDto } from '../dto/report.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { ReportFileUpdateDto } from '../dto/report-file.update.dto';
import { DeleteDto } from '../../utils/delete.dto';

/**
 * Сервис для сущности "Отчет"
 */
@Injectable()
export class ReportService {
	/**
	 * Сервис для сущности "Отчет"
	 * @param prisma Подключение к Prisma
	 * @param reportPayloadService Сервис для работы с файлами отчета
	 * @param reportMapper Маппер сущности "Отчет"
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly reportPayloadService: ReportPayloadService,
		private readonly reportMapper: ReportMapper
	) {}

	/**
	 * Поиск множества отчетов
	 * @param params Параметры поиска
	 * @returns Список отчетов
	 */
	public async findAll(
		params: ReportFindManyParams
	): Promise<ReportItemDto[]> {
		Logger.log('finding all reports', this.constructor.name);

		return (await this.prisma.report.findMany({ ...params })).map(
			this.reportMapper.toItemDto
		);
	}

	/**
	 * Поиск отчета по ID для карточки
	 * @param id ID отчета
	 * @returns Карточка отчета
	 */
	public async findById(id: number): Promise<ReportCardDto> {
		Logger.log(`finding report by id, id: ${id}`, this.constructor.name);

		const report = await this.prisma.report.findUnique({
			where: { id },
			include: { creator: true, shop: true }
		});

		if (!report) {
			throw new NotFoundException(
				format(
					ReportStrings.NOT_FOUND_SMTH,
					ReportStrings.REPORT_NOMINATIVE,
					id
				)
			);
		}

		return this.reportMapper.toCardDto(report, report.creator, report.shop);
	}

	/**
	 * Поиск отчета по ID для обновления
	 * @param id ID отчета
	 * @returns DTO обновления
	 */
	public async findForUpdate(id: number): Promise<ReportUpdateDto> {
		Logger.log(
			`find for update report by id: ${id}, shopId: ${id}`,
			this.constructor.name
		);

		const report = await this.prisma.report.findUnique({ where: { id } });

		if (!report) {
			throw new NotFoundException(
				format(
					ReportStrings.NOT_FOUND_SMTH,
					ReportStrings.REPORT_NOMINATIVE,
					id
				)
			);
		}

		return this.reportMapper.toUpdateDto(report);
	}

	/**
	 * Создание отчета
	 * @param dto DTO создания отчета
	 * @param creatorId ID создателя отчета
	 * @returns Результат создания отчета
	 */
	public async create(
		dto: ReportCreateDto,
		creatorId: number
	): Promise<CreationResultDto> {
		Logger.log(
			`create report, dto: ${dto}, shop id: ${dto.shopId}`,
			this.constructor.name
		);

		const shop = await this.prisma.shop.findUniqueOrThrow({
			where: { id: dto.shopId }
		});

		const fullPathToFile = await this.reportPayloadService.saveToFile(
			shop.uuid,
			dto.file,
			dto.payload
		);

		const saveResult = await this.prisma.report.create({
			data: this.reportMapper.create(
				dto,
				fullPathToFile,
				creatorId,
				shop.id
			)
		});

		Logger.log(
			`report created, id: ${saveResult.id}`,
			this.constructor.name
		);

		return new CreationResultDto(saveResult.id);
	}

	/**
	 * Обновление отчета
	 * @param dto DTO обновления
	 * @param id ID отчета
	 * @returns Обновленный отчет
	 */
	public async update(
		dto: ReportUpdateDto,
		id: number
	): Promise<ReportCardDto> {
		Logger.log(
			`update report, id: ${id}, dto: ${dto}`,
			this.constructor.name
		);

		const entity = await this.prisma.report.update({
			data: this.reportMapper.update(dto),
			where: { id },
			include: { creator: true, shop: true }
		});

		return this.reportMapper.toCardDto(entity, entity.creator, entity.shop);
	}

	/**
	 * Обновление файла отчета
	 * @param dto DTO обновления файла отчета
	 * @param id ID отчета
	 * @returns Обновленный отчет
	 */
	public async updateFilePayload(
		dto: ReportFileUpdateDto,
		id: number
	): Promise<ReportCardDto> {
		Logger.log(`updated report payload, id: ${id}`, this.constructor.name);

		const entity = await this.prisma.report.findUnique({
			where: { id },
			include: { creator: true, shop: true }
		});

		await this.reportPayloadService.updateFile(entity.file, dto.payload);

		return this.reportMapper.toCardDto(entity, entity.creator, entity.shop);
	}

	/**
	 * Пометка отчета, как просмотренного менеджером
	 * @param reportId ID отчета
	 */
	public async seenByManager(id: number): Promise<void> {
		Logger.log(`seen by manager report, id: ${id}`, this.constructor.name);

		const saveResult = await this.prisma.report.update({
			data: { seenByManager: true },
			where: { id: Number(id) }
		});

		Logger.log(
			`seen by manager updated report, id: ${saveResult.id}, seen: ${saveResult.seenByManager}`,
			this.constructor.name
		);
	}

	/**
	 * Удаление отчетов
	 * @param shopId ID магазиан
	 * @param dto DTO удаления
	 */
	public async remove(dto: DeleteDto): Promise<void> {
		Logger.log(
			`remove reports, ids: ${dto.ids.join(', ')}`,
			this.constructor.name
		);

		const searchCondition = { where: { id: { in: dto.ids } } };

		const filesForDelete = (
			await this.prisma.report.findMany(searchCondition)
		).map(candidate => candidate.file);

		this.reportPayloadService.deleteFiles(filesForDelete);

		await this.prisma.report.deleteMany(searchCondition);
	}
}
