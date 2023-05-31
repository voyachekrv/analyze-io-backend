import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	HttpCode,
	Get,
	Param,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
	UsePipes,
	ValidationPipe,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	UploadedFile,
	Patch,
	UseInterceptors
} from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiConsumes
} from '@nestjs/swagger';
import { ShopAvatarService } from '../services/shop-avatar.service';
import { ShopService } from '../services/shop.service';
import { UserRole } from '@prisma/client';
import { ShopItemDto } from '../dto/shop.item.dto';
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { RolesGuard } from '../../user/guards/roles.guard';
import { mapQueryToFindParams } from '../shop.search-mapping';
import { ShopCardDto } from '../dto/shop.card.dto';
import { ShopUpdateDto } from '../dto/shop.update.dto';
import { ShopCreateDto } from '../dto/shop.create.dto';
import { CreationResultDto } from '../../utils/creation-result.dto';
import { DeleteDto } from '../../utils/delete.dto';
import { AvatarPath } from '../../utils/avatar-path.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { normalizeBoolean } from '../../utils/normalize-boolean';
import { CheckShopAndStaffBelongingGuard } from '../guards/check-shop-and-staff-belonging.guard';
import { ShopChangeStaffOperation } from '../enums/shop-change-staff-operation.enum';
import { ShopChangeStaffDto } from '../dto/shop-change-staff.dto';
import { CheckOperationGuard } from '../guards/check-operation.guard';
import { ShopStaffService } from '../services/shop-staff.service';
import { ShopChangeManagerDto } from '../dto/shop-change-manager.dto';
import { ShopChangeManagerResultDto } from '../dto/shop-change-manager-result.dto';
import { ManagerGuard } from '../../user/guards/manager.guard';
import { CheckShopBelongingGuard } from '../guards/check-shop-belonging.guard';

/**
 * Контроллер сущности "Магазин"
 */
@Controller('shop')
@ApiTags('Интернет-магазины пользователя')
@ApiBearerAuth()
export class ShopController {
	/**
	 * Контроллер сущности "Магазин"
	 * @param shopService Сервис магазина
	 * @param shopAvatarService Сервис аватаров магазина
	 * @param shopStaffService Сервис персонала магазина
	 */
	constructor(
		private readonly shopService: ShopService,
		private readonly shopAvatarService: ShopAvatarService,
		private readonly shopStaffService: ShopStaffService
	) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение списка магазинов'
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
		type: [ShopItemDto],
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
	): Promise<ShopItemDto[]> {
		return await this.shopService.findAll(
			mapQueryToFindParams(take, skip, where, orderBy)
		);
	}

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение карточки магазина по его ID'
	})
	@ApiImplicitQueries([
		{
			name: 'showStaff',
			required: false,
			description:
				'Отображать ли сотрудников магазина при выводе (по умолчанию: false)',
			type: Boolean
		}
	])
	@ApiResponse({
		type: ShopCardDto,
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
	public async getCard(
		@Param('id') id: number,
		@Query('showStaff') showStaff = false
	): Promise<ShopCardDto> {
		if (!isNaN(Number(id))) {
			return await this.shopService.findById(
				Number(id),
				normalizeBoolean(showStaff)
			);
		}

		throw new BadRequestException();
	}

	@Get(':id/edit')
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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

	@Put(':id')
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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
		return await this.shopService.update(
			request['user']['id'],
			Number(id),
			dto
		);
	}

	@Patch(':id/avatar')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@ApiOperation({
		summary: 'Загрузка аватара магазина'
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary'
				}
			}
		}
	})
	@ApiResponse({
		description: 'Файл был загружен',
		status: 200
	})
	public async uploadAvatar(
		@Req() request: Request,
		@Param('id') id: number,
		@UploadedFile(
			'file',
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 1000 * 1024 }),
					new FileTypeValidator({ fileType: /image\/(png|jpeg)$/ })
				]
			})
		)
		file: Express.Multer.File
	): Promise<AvatarPath> {
		return await this.shopAvatarService.loadShopAvatar(
			file,
			request['user']['id'],
			Number(id)
		);
	}

	@Patch(':id/owner')
	@HttpCode(200)
	@UseGuards(RolesGuard, ManagerGuard, CheckShopBelongingGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
	@UsePipes(new ValidationPipe())
	@ApiOperation({
		summary: 'Смена владельца магазина'
	})
	@ApiResponse({
		description: 'ID созданного магазина',
		status: 200,
		type: ShopChangeManagerResultDto
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
		@Body() dto: ShopChangeManagerDto,
		@Param('id') id: number
	): Promise<ShopChangeManagerResultDto> {
		return await this.shopStaffService.changeShopManager(Number(id), dto);
	}

	@Patch(':id/staff')
	@HttpCode(200)
	@UseGuards(RolesGuard, CheckOperationGuard, CheckShopAndStaffBelongingGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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
		description: 'Обновленная информация о магазине',
		status: 200,
		type: ShopCardDto
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
	public async changeStaff(
		@Body() dto: ShopChangeStaffDto,
		@Param('id') id: number,
		@Query('operation') operation: ShopChangeStaffOperation
	): Promise<ShopCardDto> {
		return await this.shopStaffService.changeStaff(
			Number(id),
			operation,
			dto
		);
	}

	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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
