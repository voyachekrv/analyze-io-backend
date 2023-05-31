import { Controller, Get, Param } from '@nestjs/common';
import { MonitorScriptService } from './monitor-script.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Контроллер для работы со скриптом отслеживания
 */
@Controller('monitor-script')
export class MonitorScriptController {
	constructor(private readonly monitorScriptService: MonitorScriptService) {}

	@Get(':shopUUID')
	@ApiOperation({
		summary: 'Получение строки подключения скрипта отслеживания'
	})
	@ApiResponse({
		type: String,
		description: 'Строка подключения',
		status: 200
	})
	public getConnectionString(@Param('shopUUID') shopUUID: string): string {
		return this.monitorScriptService.getConnectionString(shopUUID);
	}
}
