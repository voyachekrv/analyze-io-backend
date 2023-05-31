import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Сервис для работы со строкой подключения к скрипту отслеживания
 */
@Injectable()
export class MonitorScriptService {
	/**
	 * Сервис для работы со строкой подключения к скрипту отслеживания
	 * @param configService Конфигурация приложения
	 */
	constructor(private readonly configService: ConfigService) {}

	/**
	 * Формирование строки подключения к скрипту
	 * @param shopUUID UUID магазина
	 * @returns Строка подключения - теги script
	 */
	public getConnectionString(shopUUID: string) {
		Logger.log(
			`getting connection string, shopUUID: ${shopUUID}`,
			this.constructor.name
		);

		return `
		<script src="${this.configService.get<string>(
			'AIO_MONITOR_SCRIPT_URL'
		)}"></script>
		<script>monitor.init('${shopUUID}')</script>
		`.trim();
	}
}
