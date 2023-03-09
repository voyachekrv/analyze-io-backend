import { promisifyProcessNoOutput } from '../src/utils/promisify-process';
import { config } from 'dotenv';
import * as PG from 'pg';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Настройки, производящиеся после окончания процесса тестирования
 */
const jestGlobalTeardown = async () => {
	config({ path: '.env.test' });

	await promisifyProcessNoOutput('npm run migration:revert-test');

	const pool = new PG.Pool({
		user: process.env.POSTGRES_USER,
		database: process.env.POSTGRES_DB,
		password: process.env.POSTGRES_PASSWORD,
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT),
		max: 10,
		idleTimeoutMillis: 30000
	});

	pool.on('error', err => {
		console.error('idle client error', err.message, err.stack);
	});

	await pool.query('drop table public.migrations');
	await pool.end();

	const resources = path.resolve(process.cwd(), process.env.AIO_FILE_STORAGE);

	if (fs.existsSync(resources)) {
		fs.rmSync(resources, { recursive: true, force: true });
	}
};

export default jestGlobalTeardown;
