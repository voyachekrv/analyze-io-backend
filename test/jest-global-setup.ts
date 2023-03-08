import { exec } from 'child_process';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Исполнение консольной команды запуска миграции тестовой базы данных
 * @returns Promise-объект
 */
const promisifyProcess = () =>
	new Promise((resolve, reject) => {
		exec('npm run migration:run-test', err => {
			if (err) {
				reject(err);
			} else {
				resolve(null);
			}
		});
	});

/**
 * Настройки, производящиеся перед началом процесса тестирования
 */
const jestGlobalSetup = async () => {
	config({ path: '.env.test' });

	const fileStorage = path.resolve(
		process.cwd(),
		process.env.AIO_FILE_STORAGE
	);

	if (!fs.existsSync(fileStorage)) {
		fs.mkdirSync(fileStorage);

		const tmpStorage = path.resolve(
			fileStorage,
			process.env.AIO_FILE_TEMP_DESTINATION
		);

		if (!fs.existsSync(tmpStorage)) {
			fs.mkdirSync(tmpStorage);
		}
	}

	await promisifyProcess();
};

export default jestGlobalSetup;
