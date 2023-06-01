import { Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { promisifyProcess } from './promisify-process';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Получить количество доступных для применения миграций
 * @returns Количество доступных миграции в директории prisma/migrations
 */
const getAvailableMigrationsCount = async (): Promise<number> => {
	const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
	return (await fs.readdir(migrationsPath)).length - 1;
};

/**
 * Получиить Количество примененных миграций к базе данных
 * @param prisma Подключение к prisma
 * @returns Количество примененных миграций к базе данных
 */
const getAppliedMigrationsCount = async (
	prisma: PrismaClient
): Promise<number> => {
	const migrationsCount = await prisma.$queryRaw(
		Prisma.sql`SELECT COUNT(*) as "migrationsCount" FROM _prisma_migrations;`
	);

	return Number(migrationsCount[0].migrationsCount);
};

/**
 * Проверка на необходимость создания таблиц в БД с нуля
 * @param prisma Подключение к prisma
 * @returns Нужна ли первоначальная миграция базы данных
 */
const isNeedToFirstTimeMigrate = async (prisma: PrismaClient) => {
	const exists = await prisma.$queryRaw(Prisma.sql`
	SELECT EXISTS (
		SELECT FROM 
			pg_tables
		WHERE 
			schemaname = 'public' AND 
			tablename  = '_prisma_migrations'
		);`);

	return !exists[0].exists;
};

/**
 * Запуск миграций через Prisma
 */
export const runPrismaMigrations = async (): Promise<void> => {
	Logger.log('Checking database migrations...', 'main');

	const prisma = new PrismaClient();

	const needToFirstTimeMigrate = await isNeedToFirstTimeMigrate(prisma);

	if (needToFirstTimeMigrate) {
		Logger.log('Database migrations will be applied at first time', 'main');

		await promisifyProcess('npm run prisma:migrate');
	} else {
		const availableMigrationsCount = await getAvailableMigrationsCount();
		const appliedMigrationsCount = await getAppliedMigrationsCount(prisma);

		if (availableMigrationsCount > appliedMigrationsCount) {
			Logger.log('News database migrations will be applied', 'main');

			await promisifyProcess('npm run prisma:migrate');
		} else {
			Logger.log('All database migrations are up to date', 'main');
		}
	}
};
