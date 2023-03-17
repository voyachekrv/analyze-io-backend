import { ShopService } from '../services/shop.service';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseBoolPipe,
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
import { Request } from 'express';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserRoles } from '../../user/entities/user.entity';
import { RolesGuard } from '../../user/guards/roles.guard';
import { ValidateQueryParamGuard } from '../../user/guards/validate-query-param.guard';
import { Page } from '../../utils/page';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { DeleteDto } from '../../utils/delete.dto';
import { ManagerGuard } from '../../user/guards/manager.guard';
import { ShopPatchDto } from '../dto/shop.patch.dto';
import { ShopPatchInputDto } from '../dto/shop.patch-input.dto';
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator';
import { ShopChangeStaffDto } from '../dto/shop.change-staff.dto';
import { ShopChangeStaffOperation } from '../enums/shop-change-staff-operation';
import { ShopStaffService } from '../services/shop.staff.service';

@Controller('shop')
@ApiTags('Интернет-магазины пользователя')
@ApiBearerAuth()
export class ShopController {
	constructor(
		private readonly shopService: ShopService,
		private readonly shopStaffService: ShopStaffService
	) {}

	/**
	 * Получение всех магазинов
	 * @param request HTTP-request
	 * @param page Номер страницы
	 * @returns Страница со списком магазинов
	 */
	@Get()
	@UseGuards(RolesGuard, ValidateQueryParamGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение списка магазинов'
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
							name: { type: 'string', example: 'Aliexpress' }
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
	public index(
		@Req() request: Request,
		@Query('page') page: number
	): Promise<Page<ShopItemDto>> {
		return this.shopService.findAll(request['user']['id'], page);
	}

	/**
	 * Получение карточки магазина
	 * @param id ID пользователя
	 * @returns Карточка пользователя
	 */
	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение карточки магазина по его ID'
	})
	@ApiImplicitQueries([
		{
			name: 'staff',
			type: Boolean,
			required: true,
			description: 'Отображать ли персонал магазина'
		}
	])
	@ApiResponse({
		type: ShopCardDto,
		description: 'Карточка магазина',
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
	public async getCard(
		@Req() request: Request,
		@Param('id') id: number,
		@Query(
			'staff',
			new ParseBoolPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })
		)
		staff: boolean
	): Promise<ShopCardDto> {
		if (!isNaN(Number(id))) {
			return await this.shopService.findById(
				request['user']['id'],
				Number(id),
				staff
			);
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
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение информации для обновления магазина'
	})
	@ApiResponse({
		type: ShopUpdateDto,
		description: 'DTO обновления магазина',
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
		@Req() request: Request,
		@Param('id') id: number
	): Promise<ShopUpdateDto> {
		if (!isNaN(Number(id))) {
			return await this.shopService.findForUpdate(
				request['user']['id'],
				Number(id)
			);
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
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Создание магазина'
	})
	@ApiResponse({
		description: 'ID созданного магазина',
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
		@Req() request: Request,
		@Body() dto: ShopCreateDto
	): Promise<CreationResultDto> {
		return new CreationResultDto(
			(await this.shopService.create(request['user']['id'], dto)).id
		);
	}

	/**
	 * Смена владельца магазина
	 * @param id ID магазина
	 * @param req HTTP Request
	 * @param dto DTO обновления
	 * @returns данные обновленной сущности
	 */
	@Patch(':id/owner')
	@HttpCode(200)
	@UseGuards(RolesGuard, ManagerGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Смена владельца магазина'
	})
	@ApiResponse({
		description: 'ID созданного магазина',
		status: 200,
		type: ShopPatchDto
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
		description: 'Not Found'
	})
	public async changeOwner(
		@Req() req: Request,
		@Body() dto: ShopPatchInputDto,
		@Param('id') id: number
	): Promise<ShopPatchDto> {
		return await this.shopStaffService.changeOwner(
			req['user']['id'],
			Number(id),
			dto.managerId
		);
	}

	/**
	 * Смена владельца магазина
	 * @param id ID магазина
	 * @param req HTTP Request
	 * @param dto DTO обновления
	 * @returns данные обновленной сущности
	 */
	@Patch(':id/staff')
	@HttpCode(200)
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Добавление / Удаление персонала магазина'
	})
	@ApiImplicitQueries([
		{
			name: 'operation',
			enum: ['add', 'remove'],
			required: true
		}
	])
	@ApiResponse({
		description: 'ID созданного магазина',
		status: 200,
		type: ShopPatchDto
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
		description: 'Not Found'
	})
	public changeStaff(
		@Req() req: Request,
		@Body() dto: ShopChangeStaffDto,
		@Param('id') id: number,
		@Query('operation') operation: ShopChangeStaffOperation
	): Promise<ShopCardDto> {
		if (
			operation !== ShopChangeStaffOperation.add &&
			operation !== ShopChangeStaffOperation.remove
		) {
			throw new BadRequestException('Операция ожидается: add или remove');
		} else {
			return this.shopStaffService.changeDataScientists(
				id,
				req['user']['id'],
				dto.dataScientistIds,
				operation
			);
		}
	}

	/**
	 * Обвновление магазина
	 * @param id ID магазина
	 * @param req HTTP Request
	 * @param dto DTO обновления
	 * @returns ID обновленной сущности
	 */
	@Put(':id')
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Обновление данных о магазине'
	})
	@ApiResponse({
		type: ShopUpdateDto,
		description: 'ID обновленнного магазина',
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
		@Req() request: Request,
		@Param('id') id: number,
		@Body() dto: ShopUpdateDto
	): Promise<ShopUpdateDto> {
		return await this.shopService.update(request['user']['id'], id, dto);
	}

	/**
	 * Удаление магазинов
	 * @param req HTTP Request
	 * @param dto DTO удаления
	 */
	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRoles.DATA_SCIENCE_MANAGER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Удаление магазинов'
	})
	@ApiResponse({
		description: 'Магазиноы были удалены',
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
		await this.shopService.remove(request['user']['id'], dto);
	}
}
