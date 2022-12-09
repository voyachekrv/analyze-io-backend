import { config } from 'dotenv';
import * as PG from 'pg';

const jestGlobalTeardown = async () => {
	config({ path: '.env.test' });

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

	await pool.query('drop table usr."user"');
	await pool.query('drop schema usr');
	await pool.query('drop table public.migrations');
	await pool.end();
};

export default jestGlobalTeardown;
