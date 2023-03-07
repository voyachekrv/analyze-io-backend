import {
	Injectable,
	InternalServerErrorException,
	Logger,
	StreamableFile
} from '@nestjs/common';
import { ShopService } from '../../commerce/services/shop.service';
import { ConnectionStringType } from '../../utils/connection-string.type';
import { ConfigService } from '@nestjs/config';
import { Prefixes } from '../../prefixes';
import { createReadStream } from 'fs';
import { join, resolve } from 'path';
import * as fs from 'fs/promises';

/**
 * Сервис для работы с ресурсами
 */
@Injectable()
export class ResourceService {
	private readonly monitorScriptName: string = 'monitor.js';

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
			'AIO_APP_HOST'
		)}/${Prefixes.GLOBAL}/resource/monitor/monitor.js`;

		let connectionString = `<script src="${bundleLink}"></script>`;

		connectionString += `<script>monitor.init('${shop.uuid}')</script>`;

		return { connectionString };
	}

	/**
	 * Перемещение файла из временного хранилища на постоянное хранилище
	 * @param file Загруженный файл
	 */
	public async fileToVolume(file: Express.Multer.File): Promise<void> {
		const newPath = resolve(
			process.cwd(),
			this.configService.get<string>('AIO_FILE_STORAGE'),
			this.monitorScriptName
		);

		try {
			await fs.rename(file.path, newPath);
			Logger.log(
				'File monitor.js was successfully moved to the volume',
				this.constructor.name
			);
		} catch (error) {
			Logger.error(error, this.constructor.name);
			throw new InternalServerErrorException(error);
		}
	}

	/**
	 * Получение скрипта мониторинга
	 * @returns Скрипт мониторинга в виде файлового потока
	 */
	public streamMonitorScript(): StreamableFile {
		const file = createReadStream(
			join(
				process.cwd(),
				this.configService.get<string>('AIO_FILE_STORAGE'),
				this.monitorScriptName
			)
		);
		return new StreamableFile(file);
	}
}
