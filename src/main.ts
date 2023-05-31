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

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', '*');
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});

	const prismaService = app.get(PrismaService);
	await prismaService.enableShutdownHooks(app);

	app.use(express.static(path.join(process.cwd(), 'resources')));

	SwaggerModule.setup(UrlPrefixes.DOCS, app, createSwaggerDocument(app));

	mkResourcesDir(configService.get<string>('AIO_FILE_STORAGE'));

	appPort = configService.get<number>('AIO_PORT');

	await app.listen(appPort);
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
