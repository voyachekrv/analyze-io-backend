import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { ReportMapper } from '../mappers/report.mapper';
import { ReportItemDto } from '../dto/report.item.dto';
import { ReportCardDto } from '../dto/report.card.dto';
import { ReportUpdateDto } from '../dto/report.update.dto';
import { ReportPayloadService } from './report.payload.service';
import { ReportCreateDto } from '../dto/report.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { ShopRepository } from '../../commerce/repositories/shop.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { DeleteDto } from '../../utils/delete.dto';
import { ReportFileUpdateDto } from '../dto/report-file.update.dto';

/**
 * Сервис для сущности "Отчет"
 */
@Injectable()
export class ReportService {
	/**
	 * Сервис для сущности "Отчет"
	 * @param reportPayloadService Сервис для содержимого файла отчета
	 * @param userRepository Репозиторий сущности "Пользователь"
	 * @param shopRepository Репозиторий сущности "Магазин"
	 * @param reportRepository Репозиторий сущности "Отчет"
	 * @param reportMapper Маппер сущности "Отчет"
	 */
	constructor(
		private readonly reportPayloadService: ReportPayloadService,
		private readonly userRepository: UserRepository,
		private readonly shopRepository: ShopRepository,
		private readonly reportRepository: ReportRepository,
		private readonly reportMapper: ReportMapper
	) {}

	/**
	 * Получение всех отчетов на магазине
	 * @param shopId ID магазина
	 * @returns Список отчетов
	 */
	public async findAll(shopId: number): Promise<ReportItemDto[]> {
		Logger.log(
			`find all reports, shop id: ${shopId}`,
			this.constructor.name
		);

		return (await this.reportRepository.findAll(shopId)).map(e =>
			this.reportMapper.toItemDto(e)
		);
	}

	/**
	 * Получение отчета по его ID
	 * @param shopId ID магазина
	 * @param id ID отчета
	 * @returns Отчет
	 */
	public async findById(shopId: number, id: number): Promise<ReportCardDto> {
		Logger.log(
			`find report by id: ${id}, shopId: ${id}`,
			this.constructor.name
		);

		const entity = await this.reportRepository.findById(shopId, id);

		if (!entity) {
			throw new NotFoundException(`Отчет с ID ${id} не найден`);
		}

		return this.reportMapper.toCardDto(entity);
	}

	/**
	 * Получение отчета по его ID для обновления
	 * @param shopId ID магазина
	 * @param id ID отчета
	 * @returns Отчет
	 */
	public async findForUpdate(
		shopId: number,
		id: number
	): Promise<ReportUpdateDto> {
		Logger.log(
			`find for update report by id: ${id}, shopId: ${id}`,
			this.constructor.name
		);

		const entity = await this.reportRepository.findById(shopId, id);

		if (!entity) {
			throw new NotFoundException(`Отчет с ID ${id} не найден`);
		}

		return this.reportMapper.toUpdateDto(entity);
	}

	/**
	 * Создание отчета
	 * @param dto DTO создания
	 * @param shopId ID магазина
	 * @param dataScientistId ID создателя отчета
	 * @returns ID нового отчета
	 */
	public async create(
		dto: ReportCreateDto,
		shopId: number,
		dataScientistId: number
	): Promise<CreationResultDto> {
		Logger.log(
			`create report, dto: ${dto}, shop id: ${shopId}`,
			this.constructor.name
		);

		const shop = await this.shopRepository.findById(shopId);
		const dataScientist = await this.userRepository.findById(
			dataScientistId
		);

		const fullPath = await this.reportPayloadService.saveToFile(
			shop.uuid,
			dto.file,
			dto.payload
		);

		const entity = this.reportMapper.create(
			dto,
			fullPath,
			dataScientist,
			shop
		);

		const saveResult = await this.reportRepository.save(entity);

		Logger.log(
			`report created, id: ${saveResult.id}`,
			this.constructor.name
		);

		return new CreationResultDto(saveResult.id);
	}

	/**
	 * Обновление отчета
	 * @param dto DTO обновления
	 * @param shopId ID магазина
	 * @param id ID отчета
	 * @returns Обновленный отчет
	 */
	public async update(
		dto: ReportUpdateDto,
		shopId: number,
		id: number
	): Promise<ReportCardDto> {
		Logger.log(
			`update report, id: ${id}, dto: ${dto}, shop id: ${shopId}`,
			this.constructor.name
		);

		const entity = await this.reportMapper.update(dto, shopId, id);

		const updateResult = await this.reportRepository.save(entity);

		Logger.log(`updated report, id: ${id}`, this.constructor.name);

		return this.reportMapper.toCardDto(updateResult);
	}

	/**
	 * Обновление файла отчета
	 * @param dto DTO обновления файла отчета
	 * @param shopId ID магазина
	 * @param id ID отчета
	 * @returns Обновленный отчет
	 */
	public async updateFilePayload(
		dto: ReportFileUpdateDto,
		shopId: number,
		id: number
	): Promise<ReportCardDto> {
		Logger.log(
			`updated report payload, id: ${id}, shopId: ${shopId}`,
			this.constructor.name
		);

		const entity = await this.reportRepository.findById(shopId, id);

		await this.reportPayloadService.updateFile(entity.file, dto.payload);

		return this.reportMapper.toCardDto(entity);
	}

	/**
	 * Пометка отчета, как просмотренного менеджером
	 * @param shopId ID магазина
	 * @param reportId ID отчета
	 */
	public async seenByManager(
		shopId: number,
		reportId: number
	): Promise<void> {
		Logger.log(
			`seen by manager report, id: ${reportId}, shopId: ${shopId}`,
			this.constructor.name
		);

		const entity = await this.reportRepository.findById(shopId, reportId);

		entity.seenByManager = true;

		const saveResult = await this.reportRepository.save(entity);

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
	public async remove(shopId: number, dto: DeleteDto) {
		const reports = await this.reportRepository.findAllByIds(
			shopId,
			dto.ids
		);

		Logger.log(
			`remove reports, ids: ${dto.ids.join(', ')}, shop id: ${shopId}`,
			this.constructor.name
		);

		const filesForDelete = reports.map(e => e.file);

		this.reportPayloadService.deleteFiles(filesForDelete);

		await this.reportRepository.deleteByIds(shopId, dto.ids);
	}
}
