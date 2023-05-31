import {
	Body,
	Controller,
	Delete,
	HttpCode,
	Patch,
	Post,
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
import { DataScientistService } from '../services/data-scientist.service';
import { UserCreateDto } from '../../user/dto/user/user.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { RolesGuard } from '../../user/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { SubordinateChangeManagerResultDto } from '../dto/subordinate-change-manager-result.dto';
import { SubordinateChangeManagerDto } from '../dto/subordinate-change-manager.dto';
import { ManagerChangeResult } from '../types/manager-change-result.type';
import { ManagerGuard } from '../../user/guards/manager.guard';
import { DeleteDto } from '../../utils/delete.dto';

/**
 * Контроллер для работы с аналитиками
 */
@Controller('data-scientist')
@ApiTags('Управление аналитиками')
@ApiBearerAuth()
export class DataScientistController {
	/**
	 * Контроллер для работы с аналитиками
	 * @param dataScientistService Сервис для работы с аналитиками
	 */
	constructor(private readonly dataScientistService: DataScientistService) {}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Создание аналитика'
	})
	@ApiResponse({
		description: 'ID созданного аналитика',
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
	public async create(
		@Body() dto: UserCreateDto,
		@Req() request: Request
	): Promise<CreationResultDto> {
		return await this.dataScientistService.create(
			dto,
			request['user']['id']
		);
	}

	@Patch()
	@HttpCode(200)
	@UseGuards(RolesGuard, ManagerGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Переназначение аналитиков другому менеджеру'
	})
	@ApiResponse({
		description: 'Менеджер переназначен',
		status: 200,
		type: [SubordinateChangeManagerResultDto]
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
	public async changeManager(
		@Body() dto: SubordinateChangeManagerDto,
		@Req() request: Request
	): Promise<ManagerChangeResult> {
		return await this.dataScientistService.changeManager(
			request['user']['id'],
			dto
		);
	}

	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@ApiOperation({
		summary: 'Удаление аналитиков'
	})
	@ApiResponse({
		description: 'Сущности удалены',
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
		@Req() request: Request,
		@Body() dto: DeleteDto
	): Promise<void> {
		await this.dataScientistService.remove(request['user']['id'], dto);
	}
}
