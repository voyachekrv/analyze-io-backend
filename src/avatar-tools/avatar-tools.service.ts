import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { AvatarPath } from '../utils/avatar-path.type';

/**
 * Инструменты для работы с аватарами
 */
@Injectable()
export class AvatarToolsService {
	/**
	 * Инструменты для работы с аватарами
	 * @param configService Сервис конфигурации
	 */
	constructor(private readonly configService: ConfigService) {}

	/**
	 * Очистка предыдущего аватара
	 * @param pathToAvatar Путь к предыдущему аватару
	 */
	public async clearPreviousAvatar(pathToAvatar: string): Promise<void> {
		try {
			const fullPathToPreviousAvatar = path.join(
				process.cwd(),
				this.configService.get<string>('AIO_FILE_STORAGE'),
				pathToAvatar
			);

			await fs.unlink(fullPathToPreviousAvatar);
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}

	/**
	 * Перемещение файла в постоянное хранилище
	 * @param source Файл для перемещения
	 * @param target Название директории в постоянном хранилище
	 * @returns Путь файла в постоянном хранилище
	 */
	public async moveFileToPermanentStorage(
		source: Express.Multer.File,
		target: string
	): Promise<AvatarPath> {
		try {
			const avatarStorage = path.join(
				this.configService.get<string>('AIO_FILE_STORAGE'),
				target
			);

			const fullPathToStorage = path.join(process.cwd(), avatarStorage);

			if (!fsSync.existsSync(fullPathToStorage)) {
				await fs.mkdir(fullPathToStorage);
			}

			const newFileDestination = path.join(
				fullPathToStorage,
				source.filename
			);

			await fs.rename(source.path, newFileDestination);

			return {
				avatar: `/${path.join(target, source.filename)}`
			};
		} catch (e) {
			throw new InternalServerErrorException(e);
		}
	}
}
