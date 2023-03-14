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
import { DataScientistManagerService } from '../services/data-scientist-manager.service';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse
} from '@nestjs/swagger';
import { RolesGuard } from '../../user/guards/roles.guard';
import { UserRoles } from '../../user/entities/user.entity';
import { UserItemDto } from '../..//user/dto/user.item.dto';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserCardDto } from 'src/user/dto/user.card.dto';
import { CreationResultDto } from 'src/utils/creation-result.dto';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { SubordinatePatchDto } from '../dto/subordinate.patch.dto';
import { ManagerGuard } from '../guards/manager.guard';
import { DeleteDto } from 'src/utils/delete.dto';

/**
 * Контроллер для работы с аналитиками
 */
@Controller('data-scientist-manager/subordinates')
@ApiTags('Управление аналитиками')
@ApiBearerAuth()
export class DataScientistManagerController {
	/**
	 * Контроллер для работы с аналитиками
	 * @param dataScientistManagerService Сервис для работы с аналитиками
	 */
	constructor(
		private readonly dataScientistManagerService: DataScientistManagerService
	) {}

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
		return await this.dataScientistManagerService.findAll(
			request['user']['id']
		);
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
		return await this.dataScientistManagerService.findById(
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
				await this.dataScientistManagerService.create(
					dto,
					request['user']['id']
				)
			).id
		);
	}

	@Patch()
	@HttpCode(204)
	@UseGuards(RolesGuard, ManagerGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Переназначение аналитиков другому менеджеру'
	})
	@ApiResponse({
		description: 'Менеджер переназначен',
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
	public async changeManager(
		@Body() dto: SubordinatePatchDto,
		@Req() request: Request
	): Promise<void> {
		await this.dataScientistManagerService.changeManager(
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
		await this.dataScientistManagerService.remove(
			request['user']['id'],
			dto
		);
	}
}
