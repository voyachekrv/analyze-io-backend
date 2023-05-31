import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	Put,
	Query,
	UseGuards,
	UsePipes,
	ValidationPipe,
	Delete,
	HttpCode,
	Patch,
	UploadedFile,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	UseInterceptors
} from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiResponse,
	ApiOperation,
	ApiConsumes,
	ApiBody
} from '@nestjs/swagger';
import { UserItemDto } from '../dto/user/user.item.dto';
import { UserService } from '../services/user.service';
import { UserCardDto } from '../dto/user/user.card.dto';
import { ApiImplicitQueries } from 'nestjs-swagger-api-implicit-queries-decorator';
import { RolesGuard } from '../guards/roles.guard';
import { OnlyOwnerGetForUpdateGuard } from '../guards/only-owner-get-for-update.guard';
import { Roles } from '../decorators/roles-auth.decorator';
import { UserRole } from '@prisma/client';
import { UserUpdateDto } from '../dto/user/user.update.dto';
import { UserRolesDto } from '../dto/user/user.roles.dto';
import { OnlyOwnerDeleteGuard } from '../guards/only-owner-delete.guard';
import { DeleteDto } from '../../utils/delete.dto';
import { OnlyOwnerGuard } from '../guards/only-owner.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserAvatarService } from '../services/user-avatar.service';
import { AvatarPath } from '../../utils/avatar-path.type';
import { mapQueryToFindParams } from '../user.search-mapping';

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
	 * @param userAvatarService Сервис для работы с аватарами
	 */
	constructor(
		private readonly userService: UserService,
		private readonly userAvatarService: UserAvatarService
	) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
	@ApiOperation({
		summary: 'Получение списка пользователей'
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
		type: [UserItemDto],
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
	public async index(
		@Query('skip') skip?: number,
		@Query('where') where?: string,
		@Query('orderBy') orderBy?: string,
		@Query('take') take = 10
	): Promise<UserItemDto[]> {
		return await this.userService.findAll(
			mapQueryToFindParams(take, skip, where, orderBy)
		);
	}

	@Get('roles')
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER)
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

	@Get(':id')
	@UseGuards(RolesGuard)
	@Roles(UserRole.DATA_SCIENCE_MANAGER, UserRole.DATA_SCIENTIST)
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

	@Get(':id/edit')
	@UseGuards(RolesGuard, OnlyOwnerGetForUpdateGuard)
	@Roles(UserRole.DATA_SCIENTIST, UserRole.DATA_SCIENCE_MANAGER)
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

	@Put(':id')
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, OnlyOwnerGuard)
	@Roles(UserRole.DATA_SCIENTIST, UserRole.DATA_SCIENCE_MANAGER)
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
		if (!isNaN(Number(id))) {
			return await this.userService.update(Number(id), dto);
		}

		throw new BadRequestException();
	}

	@Patch(':id/avatar')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	@UseGuards(RolesGuard, OnlyOwnerGetForUpdateGuard)
	@Roles(UserRole.DATA_SCIENTIST, UserRole.DATA_SCIENCE_MANAGER)
	@ApiOperation({
		summary: 'Загрузка аватара пользователя'
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
		if (!isNaN(Number(id))) {
			return await this.userAvatarService.loadUserAvatar(
				file,
				Number(id)
			);
		}

		throw new BadRequestException();
	}

	@Delete()
	@HttpCode(204)
	@UsePipes(new ValidationPipe())
	@UseGuards(RolesGuard, OnlyOwnerDeleteGuard)
	@Roles(UserRole.DATA_SCIENTIST, UserRole.DATA_SCIENCE_MANAGER)
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
