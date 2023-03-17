import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
	Query
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Page } from '../../utils/page';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { DeleteDto } from '../../utils/delete.dto';
import { Roles } from '../decorators/roles-auth.decorator';
import { UserCardDto } from '../dto/user.card.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRolesDto } from '../dto/user.roles.dto';
import { UserUpdateDto } from '../dto/user.update.dto';
import { UserRoles } from '../entities/user.entity';
import { OnlyOwnerDeleteGuard } from '../guards/only-owner-delete.guard';
import { OnlyOwnerGetForUpdateGuard } from '../guards/only-owner-get-for-update.guard';
import { OnlyOwnerGuard } from '../guards/only-owner.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserService } from '../services/user.service';
import { ValidateQueryParamGuard } from '../guards/validate-query-param.guard';

/**
 * Контроллер для работы с пользователями
 */
@Controller('user')
@ApiTags('Работа с пользователями')
@ApiBearerAuth()
export class UserController {
	/**
	 * Контроллер для работы с пользователями
	 * @param userService Сервис для работы с пользователями
	 */
	constructor(private readonly userService: UserService) {}

	/**
	 * Получение всех пользователей
	 * @returns Список пользователей
	 */
	@Get()
	@UseGuards(RolesGuard, ValidateQueryParamGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение списка пользователей'
	})
	@ApiResponse({
		schema: {
			type: 'object',
			properties: {
				list: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'number', example: 1 },
							email: { type: 'string', example: 'john@doe.com' },
							name: { type: 'string', example: 'Jonh Doe' }
						}
					}
				},
				first: { type: 'number', example: 0 },
				total: { type: 'number', example: 7 },
				totalPages: { type: 'number', example: 4 },
				totalOnPage: { type: 'number', example: 7 },
				current: { type: 'number', example: 4 },
				last: { type: 'number', example: 3 },
				previous: { type: 'number', example: 3 },
				next: { type: 'number', example: 5 }
			}
		},
		description: 'Список пользователей',
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
	@ApiResponse({
		status: 404,
		description: 'В случае обращения к несуществующему номеру страницы'
	})
	// TODO: Сделать параметры для поиска и order by
	public async index(
		@Query('page') page: number
	): Promise<Page<UserItemDto>> {
		return await this.userService.findAll(Number(page));
	}

	/**
	 * Получение списка всех доступных ролей в системе
	 * @returns Возможные роли пользователя
	 */
	@Get('roles')
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение списка доступных ролей пользователя'
	})
	@ApiResponse({
		type: UserRolesDto,
		description: 'Список ролей, которые могут быть у пользователя',
		status: 200
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	public getRoles(): UserRolesDto {
		return this.userService.getRoles();
	}

	/**
	 * Получение карточки пользователя
	 * @param id ID пользователя
	 * @returns Карточка пользователя
	 */
	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Получение карточки пользователя по его ID'
	})
	@ApiResponse({
		type: UserCardDto,
		description: 'Карточка пользователя',
		status: 200
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
	public async getCard(@Param('id') id: number): Promise<UserCardDto> {
		if (!isNaN(Number(id))) {
			return await this.userService.findById(Number(id));
		}
		throw new BadRequestException();
	}

	/**
	 * Получение информации для обновления пользователя
	 * @param id ID пользователя
	 * @param req HTTP Request
	 * @returns DTO обновления
	 */
	@Get(':id/edit')
	@UseGuards(RolesGuard, OnlyOwnerGetForUpdateGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Получение информации для обновления пользователя'
	})
	@ApiResponse({
		type: UserUpdateDto,
		description: 'DTO обновления пользователя',
		status: 200
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
	public async findForUpdate(
		@Param('id') id: number
	): Promise<UserUpdateDto> {
		if (!isNaN(Number(id))) {
			return await this.userService.findForUpdate(Number(id));
		}
		throw new BadRequestException();
	}

	/**
	 * Создание суперпользователя (только для других суперпользователей)
	 * @param dto DTO создания пользователя
	 * @returns ID созданной сущности
	 */
	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary:
			'Создание суперпользователя (только для других суперпользователей)'
	})
	@ApiResponse({
		description: 'ID созданного суперпользователя',
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
		@Body() dto: UserCreateDto
	): Promise<CreationResultDto> {
		return new CreationResultDto(
			(await this.userService.create(dto, UserRoles.ROOT)).id
		);
	}

	/**
	 * Обвновление пользователя
	 * @param id ID пользователя
	 * @param req HTTP Request
	 * @param dto DTO обновления
	 * @returns ID обновленной сущности
	 */
	@Put(':id')
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, OnlyOwnerGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Обновление данных о пользователе'
	})
	@ApiResponse({
		type: UserUpdateDto,
		description: 'ID обновленнного пользователя',
		status: 200
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
	public async update(
		@Param('id') id: number,
		@Body() dto: UserUpdateDto
	): Promise<UserUpdateDto> {
		return await this.userService.update(id, dto);
	}

	/**
	 * Удаление пользователей
	 * @param req HTTP Request
	 * @param dto DTO удаления
	 */
	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, OnlyOwnerDeleteGuard)
	@Roles(
		UserRoles.DATA_SCIENTIST,
		UserRoles.DATA_SCIENCE_MANAGER,
		UserRoles.ROOT
	)
	@ApiOperation({
		summary: 'Удаление пользователей'
	})
	@ApiResponse({
		description: 'Пользователи были удалены',
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
		await this.userService.remove(dto);
	}
}
