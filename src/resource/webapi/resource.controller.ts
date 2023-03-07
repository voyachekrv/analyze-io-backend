import {
	Controller,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	Param,
	Req,
	StreamableFile,
	UseGuards,
	Post,
	UseInterceptors,
	UploadedFile,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	Logger
} from '@nestjs/common';
import { ResourceService } from '../services/resource.service';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiConsumes,
	ApiBody
} from '@nestjs/swagger';
import { ConnectionStringType } from '../../utils/connection-string.type';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserRoles } from '../../user/entities/user.entity';
import { RolesGuard } from '../../user/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('resource')
@ApiTags('Работа с ресурсами')
@ApiBearerAuth()
export class ResourceController {
	constructor(private readonly resourceService: ResourceService) {}

	@Get('monitor/monitor.js')
	@HttpCode(HttpStatus.OK)
	@Header('Content-Type', 'text/javascript')
	@Header('Content-Disposition', 'attachment; filename=monitor.js')
	@ApiOperation({
		summary: 'Получение бандла скрипта monitor.js'
	})
	@ApiResponse({
		description: 'JS monitor script',
		status: 200,
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'string'
				}
			}
		}
	})
	public getMonitorBundle(): StreamableFile {
		return this.resourceService.streamMonitorScript();
	}

	@Get('monitor/connection-string/:uuid')
	@UseGuards(RolesGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
	@ApiOperation({
		summary: 'Получение строки подключения к скрипту отслеживания'
	})
	@ApiResponse({
		description: 'Строка подключения в разметке HTML',
		status: 200,
		schema: {
			type: 'object',
			properties: {
				connectionString: {
					type: 'string'
				}
			}
		}
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	@ApiResponse({
		status: 404,
		description: 'Магазин не найден'
	})
	public async getConnectionString(
		@Param('uuid') uuid: string,
		@Req() request: Request
	): Promise<ConnectionStringType> {
		return await this.resourceService.getConnectionString(
			uuid,
			request['user']['id']
		);
	}

	@Post('monitor')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	@UseGuards(RolesGuard)
	@Roles(UserRoles.ROOT)
	@ApiOperation({
		summary: 'Загрузка скрипта мониторинга на сервер'
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
	@ApiResponse({
		description: 'Bad request',
		status: 400
	})
	public async upload(
		@UploadedFile(
			'file',
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 1000 * 1024 }),
					new FileTypeValidator({
						fileType: 'text/javascript'
					})
				]
			})
		)
		file: Express.Multer.File
	): Promise<void> {
		Logger.log(
			`File ${file.filename} was successfully uploaded`,
			this.constructor.name
		);

		await this.resourceService.fileToVolume(file);
	}
}
