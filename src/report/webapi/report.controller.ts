import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { ReportService } from '../services/report.service';
import { ReportItemDto } from '../dto/report.item.dto';
import { mapQueryToFindParams } from '../report.search-mapping';
import { RolesGuard } from '../../user/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { ReportUserRelationshipGuard } from '../guards/report-user-relationship.guard';
import { ReportCardDto } from '../dto/report.card.dto';
import { ReportUpdateDto } from '../dto/report.update.dto';
import { ReportUserRelationshipUpdateGuard } from '../guards/report-user-relationship-update.guard';
import { ReportCreateDto } from '../dto/report.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { UserShopRelationshipGuard } from '../guards/user-shop-relationship.guard';
import { ReportFileUpdateDto } from '../dto/report-file.update.dto';
import { SeeByManagerGuard } from '../guards/see-by-manager.guard';
import { DeleteDto } from '../../utils/delete.dto';
import { ReportRemoveGuard } from '../guards/report-remove.guard';

/**
 * Контроллер сущности "Отчет"
 */
@Controller('report')
@ApiTags('Работа с отчетами')
@ApiBearerAuth()
export class ReportController {
	/**
	 * Контроллер сущности "Отчет"
	 * @param reportService Сервис для работы с отчетами
	 */
	constructor(private readonly reportService: ReportService) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение списка отчетов'
	})
	@ApiImplicitQueries([
		{
			name: 'take',
			required: false,
			description: 'Количество записей для взятия (по умолчанию 10)',
			type: Number
		},
		{
			name: 'skip',
			required: false,
			description: 'Количество записей для пропуска',
			type: Number
		},
		{
			name: 'where',
			required: false,
			description: 'Where-запрос в формате Prisma',
			type: String
		},
		{
			name: 'orderBy',
			required: false,
			description: 'OrderBy-запрос в формате Prisma',
			type: String
		}
	])
	@ApiResponse({
		type: [ReportItemDto],
		description: 'Список магазинов',
		status: 200
	})
	@ApiResponse({
		status: 400,
		description: 'Некоректно введенный параметр запроса'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public async index(
		@Query('skip') skip?: number,
		@Query('where') where?: string,
		@Query('orderBy') orderBy?: string,
		@Query('take') take = 10
	): Promise<ReportItemDto[]> {
		return await this.reportService.findAll(
			mapQueryToFindParams(take, skip, where, orderBy)
		);
	}

	@Get(':id')
	@UseGuards(RolesGuard, ReportUserRelationshipGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение отчета по ID'
	})
	@ApiResponse({
		description: 'Отчет',
		status: 200,
		type: ReportCardDto
	})
	@ApiResponse({
		description: 'Forbidden',
		status: 403
	})
	@ApiResponse({
		description: 'Not found',
		status: 404
	})
	public async getCard(@Param('id') id: number): Promise<ReportCardDto> {
		return await this.reportService.findById(Number(id));
	}

	@Get(':id/edit')
	@UseGuards(RolesGuard, ReportUserRelationshipUpdateGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение отчета по ID для обновления'
	})
	@ApiResponse({
		description: 'Отчет',
		status: 200
	})
	@ApiResponse({
		description: 'Forbidden',
		status: 403
	})
	@ApiResponse({
		description: 'Not found',
		status: 404
	})
	public async getForUpdate(
		@Param('id') id: number
	): Promise<ReportUpdateDto> {
		return await this.reportService.findForUpdate(Number(id));
	}

	@Post()
	@UseGuards(RolesGuard, UserShopRelationshipGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Создание отчета'
	})
	@ApiResponse({
		description: 'ID созданного отчета',
		status: 201,
		type: CreationResultDto
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@ApiResponse({
		status: 500,
		description: 'Файл не был сохранен'
	})
	public async create(
		@Req() request: Request,
		@Body() dto: ReportCreateDto
	): Promise<CreationResultDto> {
		return await this.reportService.create(dto, request['user']['id']);
	}

	@Put(':id')
	@UseGuards(RolesGuard, ReportUserRelationshipGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Обновление отчета'
	})
	@ApiResponse({
		description: 'ID созданного отчета',
		status: 200,
		type: ReportCardDto
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public async update(
		@Param('id') id: number,
		@Body() dto: ReportUpdateDto
	): Promise<ReportCardDto> {
		return await this.reportService.update(dto, Number(id));
	}

	@Patch(':id')
	@UseGuards(RolesGuard, ReportUserRelationshipGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Обновление файла отчета'
	})
	@ApiResponse({
		description: 'ID созданного отчета',
		status: 200,
		type: ReportCardDto
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public async updateFilePayload(
		@Param('id') id: number,
		@Body() dto: ReportFileUpdateDto
	): Promise<ReportCardDto> {
		return await this.reportService.updateFilePayload(dto, Number(id));
	}

	@Patch(':id/see')
	@HttpCode(204)
	@UseGuards(RolesGuard, SeeByManagerGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Пометка менеджером отчета, как просмотренного'
	})
	@ApiResponse({
		description: 'Отчет просмотрен',
		status: 200
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@ApiResponse({
		status: 404,
		description: 'Not found'
	})
	public async seeByManager(@Param('id') id: number): Promise<void> {
		await this.reportService.seenByManager(id);
	}

	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, ReportRemoveGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@ApiOperation({
		summary: 'Удаление отчетов (только менеджер)'
	})
	@ApiResponse({
		description: 'Отчеты были удалены',
		status: 204
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@ApiResponse({
		status: 404,
		description: 'Not found'
	})
	public async remove(@Body() dto: DeleteDto): Promise<void> {
		await this.reportService.remove(dto);
	}
}
