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
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse
} from '@nestjs/swagger';
import { ReportService } from '../services/report.service';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserRoles } from '../../user/entities/user.entity';
import { RolesGuard } from '../../user/guards/roles.guard';
import { ReportItemDto } from '../dto/report.item.dto';
import { ReportCardDto } from '../dto/report.card.dto';
import { ReportUpdateDto } from '../dto/report.update.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { ReportCreateDto } from '../dto/report.create.dto';
import { DataScientistShopGuard } from '../guards/data-scientist-shop.guard';
import { DataScientistShopUpdateGuard } from '../guards/data-scientist-shop-update.guard';
import { DeleteDto } from '../../utils/delete.dto';
import { ReportFileUpdateDto } from '../dto/report-file.update.dto';
import { ManagerShopGuard } from '../guards/manager-shop.guard';

/**
 * Контроллер для работы с сущностью "Отчет"
 */
@Controller('shop/:shopId/report')
@ApiTags('Работа с отчетами')
@ApiBearerAuth()
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Получение списка отчетов'
	})
	@ApiResponse({
		description: 'Список пользователей',
		status: 200,
		type: [ReportItemDto]
	})
	@ApiResponse({
		description: 'Forbidden',
		status: 403
	})
	public async index(
		@Param('shopId') shopId: number
	): Promise<ReportItemDto[]> {
		return await this.reportService.findAll(Number(shopId));
	}

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Получение отчета по ID'
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
	public async getCard(
		@Param('shopId') shopId: number,
		@Param('id') id: number
	): Promise<ReportCardDto> {
		return await this.reportService.findById(Number(shopId), Number(id));
	}

	@Get(':id/edit')
	@UseGuards(RolesGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
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
		@Param('shopId') shopId: number,
		@Param('id') id: number
	): Promise<ReportUpdateDto> {
		return await this.reportService.findForUpdate(
			Number(shopId),
			Number(id)
		);
	}

	@Post()
	@UseGuards(RolesGuard, DataScientistShopGuard)
	@Roles(UserRoles.DATA_SCIENTIST, UserRoles.ROOT)
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
		@Param('shopId') shopId: number,
		@Body() dto: ReportCreateDto
	): Promise<CreationResultDto> {
		return await this.reportService.create(
			dto,
			Number(shopId),
			request['user']['id']
		);
	}

	@Put(':id')
	@UseGuards(RolesGuard, DataScientistShopUpdateGuard)
	@Roles(UserRoles.DATA_SCIENTIST, UserRoles.ROOT)
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
		@Param('shopId') shopId: number,
		@Param('id') id: number,
		@Body() dto: ReportUpdateDto
	): Promise<ReportCardDto> {
		return await this.reportService.update(dto, Number(shopId), Number(id));
	}

	@Patch(':id')
	@UseGuards(RolesGuard, DataScientistShopUpdateGuard)
	@Roles(UserRoles.DATA_SCIENTIST, UserRoles.ROOT)
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
		@Param('shopId') shopId: number,
		@Param('id') id: number,
		@Body() dto: ReportFileUpdateDto
	): Promise<ReportCardDto> {
		return await this.reportService.updateFilePayload(
			dto,
			Number(shopId),
			Number(id)
		);
	}

	@Patch(':id/see')
	@HttpCode(204)
	@UseGuards(RolesGuard, ManagerShopGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
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
	public async seeByManager(
		@Param('shopId') shopId: number,
		@Param('id') id: number
	): Promise<void> {
		await this.reportService.seenByManager(shopId, id);
	}

	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, DataScientistShopGuard)
	@Roles(UserRoles.DATA_SCIENTIST, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Удаление отчетов'
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
	public async remove(
		@Body() dto: DeleteDto,
		@Param('shopId') shopId: number
	): Promise<void> {
		return await this.reportService.remove(shopId, dto);
	}
}
