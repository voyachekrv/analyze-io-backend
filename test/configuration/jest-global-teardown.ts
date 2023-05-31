import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as PG from 'pg';

/**
 * Настройки, производящиеся после окончания процесса тестирования
 */
const jestGlobalTeardown = async () => {
	config({ path: '.env.test' });

	console.log(
		`Clearing all tables from database ${process.env.POSTGRES_DB}...`
	);

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

	await pool.query('drop table "Report"');
	await pool.query('drop table "AnalystsOnShop"');
	await pool.query('drop table "Shop"');
	await pool.query('drop table "User"');
	await pool.query('drop table "_prisma_migrations"');
	await pool.query('drop type "UserRole"');
	await pool.end();

	const resources = path.resolve(process.cwd(), process.env.AIO_FILE_STORAGE);

	if (fs.existsSync(resources)) {
		fs.rmSync(resources, { recursive: true, force: true });
	}

	console.log('Teardown done.');
};

export default jestGlobalTeardown;
