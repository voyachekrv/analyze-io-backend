import { Injectable } from '@nestjs/common';
import { ShopService } from '../../commerce/services/shop.service';
import { ConnectionStringType } from '../../utils/connection-string.type';
import { ConfigService } from '@nestjs/config';
import { Prefixes } from '../../prefixes';

/**
 * Сервис для работы с ресурсами
 */
@Injectable()
export class ResourceService {
	constructor(
		private readonly shopService: ShopService,
		private readonly configService: ConfigService
	) {}

	/**
	 * Генерация строки подключения к скрипту мониторинга
	 * @param uuid UUID магазина
	 * @param userId ID пользователя
	 * @returns Строка подключеня
	 */
	public async getConnectionString(
		uuid: string,
		userId: number
	): Promise<ConnectionStringType> {
		const shop = await this.shopService.findByUUID(uuid, userId);

		const bundleLink = `http://${this.configService.get<string>(
			'APP_HOST'
		)}/${Prefixes.GLOBAL}/resource/monitor/monitor.js`;

		let connectionString = `<script src="${bundleLink}"></script>`;

		connectionString += `<script>monitor.init('${shop.uuid}')</script>`;

		return { connectionString };
	}
}
