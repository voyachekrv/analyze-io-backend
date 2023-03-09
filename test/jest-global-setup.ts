import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { promisifyProcessNoOutput } from '../src/utils/promisify-process';

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

	await promisifyProcessNoOutput('npm run migration:run-test');
};

export default jestGlobalSetup;
