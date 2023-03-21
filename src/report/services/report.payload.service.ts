import {
	Injectable,
	InternalServerErrorException,
	Logger
} from '@nestjs/common';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { ReportPayload } from '../types/report-payload.type';
import { ConfigService } from '@nestjs/config';

/**
 * Сервис для содержимого файла отчета
 */
@Injectable()
export class ReportPayloadService {
	/**
	 * Сервис для содержимого файла отчета
	 * @param configService Сервис конфигурации
	 */
	constructor(private readonly configService: ConfigService) {}

	/**
	 * Преобразование данных и подготовка их к записи в файл
	 * @param payload Данные для записи в файл
	 * @returns Преобразованные данные, готовые к записи в файл
	 */
	private payloadToFileData(payload: ReportPayload): string {
		return JSON.stringify(payload);
	}

	/**
	 * Запись данных в файл
	 * @param fullPath Полный путь к файлу
	 * @param payload Данные для записи
	 */
	private async writeToFile(
		fullPath: string,
		payload: ReportPayload
	): Promise<void> {
		try {
			Logger.log(`writing to file ${fullPath}`, this.constructor.name);

			await fs.writeFile(fullPath, this.payloadToFileData(payload));
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}

	public async updateFile(file: string, payload: ReportPayload) {
		await this.writeToFile(
			path.join(
				process.cwd(),
				this.configService.get<string>('AIO_FILE_STORAGE'),
				file
			),
			payload
		);
	}

	/**
	 * Запись данных в файл отчета
	 * @param shopUUID UUID магазина
	 * @param name Название файла
	 * @param payload данные, которые будут записаны в файл
	 * @returns Путь к записанному файлу
	 */
	public async saveToFile(
		shopUUID: string,
		name: string,
		payload: ReportPayload
	): Promise<string> {
		const reportsDir = path.resolve(
			process.cwd(),
			this.configService.get<string>('AIO_FILE_STORAGE'),
			'reports'
		);

		if (!existsSync(reportsDir)) {
			Logger.log(
				`created directory ${reportsDir}`,
				this.constructor.name
			);

			await fs.mkdir(reportsDir);
		}

		const shopDir = path.resolve(reportsDir, shopUUID);

		if (!existsSync(shopDir)) {
			Logger.log(`created directory ${shopDir}`, this.constructor.name);

			await fs.mkdir(shopDir);
		}

		const fullPathToFile = path.resolve(shopDir, name);

		Logger.log(`write to file ${fullPathToFile}`, this.constructor.name);

		await this.writeToFile(fullPathToFile, payload);

		return `/reports/${shopUUID}/${name}`;
	}

	/**
	 * Удаление отчетов
	 * @param files Список файлов для удаления
	 */
	public async deleteFiles(files: string[]): Promise<void> {
		for (const file of files) {
			const pathToFile = path.join(
				process.cwd(),
				this.configService.get<string>('AIO_FILE_STORAGE'),
				file
			);

			Logger.log(`delete file ${pathToFile}`, this.constructor.name);

			await fs.unlink(pathToFile);
		}
	}
}
