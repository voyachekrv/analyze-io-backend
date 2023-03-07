import { ConfigService } from '@nestjs/config';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Конфигурация загрузчика файлов
 * @param configService Сервис конфигурации
 * @returns Готовая конфигурация
 */
export const multerConfig = (
	configService: ConfigService
): MulterModuleOptions => ({
	storage: diskStorage({
		destination(req, file, cb) {
			const tmpStorage = path.resolve(
				process.cwd(),
				configService.get<string>('AIO_FILE_STORAGE'),
				configService.get<string>('AIO_FILE_TEMP_DESTINATION')
			);

			if (!fs.existsSync(tmpStorage)) {
				fs.mkdirSync(tmpStorage);
			}

			cb(null, tmpStorage);
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		}
	})
});
