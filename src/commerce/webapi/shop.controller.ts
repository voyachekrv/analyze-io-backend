import { ShopService } from '../services/shop.service';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
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

@Controller('shop')
@ApiTags('Интернет-магазины пользователя')
@ApiBearerAuth()
export class ShopController {
	constructor(private readonly shopService: ShopService) {}

	/**
	 * Получение всех магазинов
	 * @param request HTTP-request
	 * @param page Номер страницы
	 * @returns Страница со списком магазинов
	 */
	@Get()
	@UseGuards(RolesGuard, ValidateQueryParamGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
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
	@Roles(UserRoles.USER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение карточки пользователя по его ID'
	})
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
		@Param('id') id: number
	): Promise<ShopCardDto> {
		if (!isNaN(Number(id))) {
			return await this.shopService.findById(
				request['user']['id'],
				Number(id)
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
	@Roles(UserRoles.USER, UserRoles.ROOT)
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
	@Roles(UserRoles.USER, UserRoles.ROOT)
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
	 * Обвновление магазина
	 * @param id ID магазина
	 * @param req HTTP Request
	 * @param dto DTO обновления
	 * @returns ID обновленной сущности
	 */
	@Put(':id')
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
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
	@Roles(UserRoles.USER, UserRoles.ROOT)
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