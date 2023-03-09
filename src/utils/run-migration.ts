import { DataSource } from 'typeorm';
import dataSource from '../db/migration-data-source';
import { typeOrmHealthCheck } from './typeorm-healthcheck';
import { promisifyProcess } from './promisify-process';

/**
 * Проверка на наличие примененных миграций в БД
 * @param dataSource Подключение к БД
 */
const checkMigrationsApplied = async (
	dataSource: DataSource
): Promise<boolean> => {
	const queryRunner = await dataSource.createQueryRunner();

	const result = await queryRunner.manager.query(
		`  SELECT EXISTS(
			SELECT *
			FROM information_schema.tables
			WHERE
			  table_schema = 'public' AND
			  table_name = 'migrations'
		);`
	);

	await dataSource.destroy();

	return result[0].exists;
};

/**
 * Применение миграции
 * @param dataSource Подключение к БД
 */
const applyMigrations = async (dataSource: DataSource) => {
	if (!(await checkMigrationsApplied(dataSource))) {
		await promisifyProcess('npm run migration:run');
	}
};

/**
 * Запуск миграций, если они еще не применены
 */
export const runMigrationIfNotExists = async () => {
	let dbPreparedFlag = false;

	while (true) {
		if (await typeOrmHealthCheck(dataSource)) {
			dbPreparedFlag = true;
			break;
		}
	}

	if (dbPreparedFlag) {
		await applyMigrations(dataSource);
	}
};
