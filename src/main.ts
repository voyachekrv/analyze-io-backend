import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UrlPrefixes } from './url-prefixes.enum';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerDocument, mkResourcesDir } from './utils/init-tools';
import { Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as path from 'path';
import * as express from 'express';
import { DatabaseHealthCheckService } from './healthcheck/database-healthcheck.service';
import { normalizeBoolean } from './utils/normalize-boolean';
import { runPrismaMigrations } from './utils/run-prisma-migrations';

let appPort: number;

/**
 * Входная точка приложения
 */
const bootstrap = async (): Promise<void> => {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true
	});
	const configService = app.get(ConfigService);

	app.setGlobalPrefix(UrlPrefixes.GLOBAL);

	app.use((_, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', '*');
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});

	const healthCheckService = app.get(DatabaseHealthCheckService);

	const skipMigrations = normalizeBoolean(
		configService.get<boolean>('AIO_SKIP_DB_MIGRATION')
	);

	let canContinueInit = false;

	while (true) {
		const dbState = await healthCheckService.getDatabaseState();

		if (dbState) {
			Logger.log('Successfully connected to database', 'main');
			canContinueInit = true;
			break;
		}

		Logger.log('Connecting to database...', 'main');
	}

	if (canContinueInit) {
		if (!skipMigrations) {
			Logger.log('Database migrations are not skipped', 'main');

			await runPrismaMigrations();
		} else {
			Logger.log('Database migrations skipped', 'main');
		}

		const prismaService = app.get(PrismaService);
		await prismaService.enableShutdownHooks(app);

		app.use(express.static(path.join(process.cwd(), 'resources')));

		SwaggerModule.setup(UrlPrefixes.DOCS, app, createSwaggerDocument(app));

		mkResourcesDir(configService.get<string>('AIO_FILE_STORAGE'));

		appPort = configService.get<number>('AIO_PORT');

		await app.listen(appPort);
	}
};

bootstrap().then(() => {
	Logger.log(
		`🚀 Application successfully started on port ${appPort}`,
		'main'
	);
	Logger.log(
		`API Documentation: http://localhost:${process.env.AIO_PORT}/${UrlPrefixes.DOCS}`,
		'main'
	);
});
