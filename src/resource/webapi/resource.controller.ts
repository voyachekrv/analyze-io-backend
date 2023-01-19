import {
	Controller,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	Param,
	Req,
	StreamableFile,
	UseGuards
} from '@nestjs/common';
import { ResourceService } from '../services/resource.service';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ConnectionStringType } from '../../utils/connection-string.type';
import { Roles } from '../../user/decorators/roles-auth.decorator';
import { UserRoles } from '../../user/entities/user.entity';
import { RolesGuard } from '../../user/guards/roles.guard';

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
		const file = createReadStream(
			join(process.cwd(), 'resources', 'monitor.js')
		);
		return new StreamableFile(file);
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
}
