import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { DataScientistService } from '../services/data-scientist.service';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse
} from '@nestjs/swagger';
import { RolesGuard } from '../../user/guards/roles.guard';
import { UserRoles } from '../../user/entities/user.entity';
import { UserItemDto } from '../../user/dto/user.item.dto';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserCardDto } from '../../user/dto/user.card.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { UserCreateDto } from '../../user/dto/user.create.dto';
import { SubordinatePatchDto } from '../dto/subordinate.patch.dto';
import { ManagerGuard } from '../../user/guards/manager.guard';
import { DeleteDto } from '../../utils/delete.dto';
import { ManagerChangeResult } from '../types/manager-change-result.type';
import { SubordinatePatchResultDto } from '../dto/subordinate-patch-result.dto';

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

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение списка аналитиков в подчинении менеджера'
	})
	@ApiResponse({
		type: [UserItemDto],
		status: 200,
		description: 'Список аналитиков'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public async index(@Req() request: Request): Promise<UserItemDto[]> {
		return await this.dataScientistService.findAll(request['user']['id']);
	}

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение аналитика по его ID'
	})
	@ApiResponse({
		type: UserCardDto,
		status: 200,
		description: 'Профиль аналитика'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@ApiResponse({
		status: 404,
		description: 'Not found'
	})
	public async getCard(
		@Req() request: Request,
		@Param('id') userId: number
	): Promise<UserCardDto> {
		return await this.dataScientistService.findById(
			request['user']['id'],
			userId
		);
	}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
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
		return new CreationResultDto(
			(
				await this.dataScientistService.create(
					dto,
					request['user']['id']
				)
			).id
		);
	}

	@Patch()
	@HttpCode(200)
	@UseGuards(RolesGuard, ManagerGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Переназначение аналитиков другому менеджеру'
	})
	@ApiResponse({
		description: 'Менеджер переназначен',
		status: 200,
		type: [SubordinatePatchResultDto]
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
		@Body() dto: SubordinatePatchDto,
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
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
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
