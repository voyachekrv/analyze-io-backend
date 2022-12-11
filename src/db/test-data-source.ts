import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config({ path: '.env.test' });

/**
 * Опции подключения к тестовой базе данных
 */
export const testDataSourceOptions: DataSourceOptions = {
	type: 'postgres',
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	entities: ['dist/**/*.entity{.ts,.js}'],
	migrations: ['dist/db/migrations/*{.ts,.js}'],
	synchronize: false,
	logging: false,
	cache: false
};

/**
 * Подключение к тестовой базе данных
 */
const testDataSource: DataSource = new DataSource(testDataSourceOptions);

export default testDataSource;
