import {
	Injectable,
	InternalServerErrorException,
	Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportPayload } from '../types/report-payload.type';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';

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

	/**
	 * Создать директорию в ресурсах в случае, если ее не существует
	 * @param directory Путь к создаваемой директории
	 */
	private async mkdirIfNotExists(directory: string): Promise<void> {
		if (!existsSync(directory)) {
			Logger.log(`created directory ${directory}`, this.constructor.name);

			await fs.mkdir(directory);
		}
	}

	/**
	 * Получить полный путь к существующему файлу отчета
	 * @param file Файл отчета
	 * @returns Путь к файлу отчета
	 */
	private getPathToExistingReportFile(file: string): string {
		return path.join(
			process.cwd(),
			this.configService.get<string>('AIO_FILE_STORAGE'),
			file
		);
	}

	/**
	 * Получить путь к директории отчетов
	 * @returns Путь к директории отчетов
	 */
	private getPathToReportsDir(): string {
		return path.join(
			process.cwd(),
			this.configService.get<string>('AIO_FILE_STORAGE'),
			'reports'
		);
	}

	/**
	 * Обновление существующего файла отчета
	 * @param file Путь к файлу
	 * @param payload Данные для записи в файл
	 */
	public async updateFile(
		file: string,
		payload: ReportPayload
	): Promise<void> {
		await this.writeToFile(this.getPathToExistingReportFile(file), payload);
	}

	/**
	 * Сохранить данные в файл отчета
	 * @param shopUUID UUID магазина
	 * @param name Название файла
	 * @param payload Данные, записываемые в файл
	 * @returns Путь к сохраненному файлу
	 */
	public async saveToFile(
		shopUUID: string,
		name: string,
		payload: ReportPayload
	): Promise<string> {
		const reportsDir = this.getPathToReportsDir();

		await this.mkdirIfNotExists(reportsDir);

		const shopDir = path.join(reportsDir, shopUUID);

		await this.mkdirIfNotExists(shopDir);

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
			const pathToFile = this.getPathToExistingReportFile(file);

			Logger.log(`delete file ${pathToFile}`, this.constructor.name);

			await fs.unlink(pathToFile);
		}
	}
}
