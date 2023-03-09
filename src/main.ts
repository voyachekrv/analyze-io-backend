import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Prefixes } from './prefixes';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { runMigrationIfNotExists } from './utils/run-migration';

let appPort: number;

const bootstrap = async () => {
	await runMigrationIfNotExists();

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true
	});
	const configService = app.get(ConfigService);

	app.setGlobalPrefix(Prefixes.GLOBAL);

	const config = new DocumentBuilder()
		.setTitle('Analyze.io - Application Service')
		.setDescription(
			`
			Бэкенд системы анализа поведения пользователя интернет-магазина Analyze.io
			`
		)
		.setVersion(process.env.npm_package_version)
		.addBearerAuth({ in: 'header', type: 'http', bearerFormat: 'JWT' })
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(Prefixes.DOCS, app, document);

	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Headers', '*');
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});

	const resourcesDir = path.join(
		process.cwd(),
		configService.get<string>('AIO_FILE_STORAGE')
	);

	if (!fs.existsSync(resourcesDir)) {
		fs.mkdirSync(resourcesDir);
	}

	appPort = configService.get<number>('AIO_PORT');

	await app.listen(appPort);
};

bootstrap().then(() => {
	Logger.log(`Application started on port ${appPort}`, 'main');
	Logger.log(
		`API Documentation: http://localhost:${process.env.AIO_PORT}/${Prefixes.DOCS}`,
		'main'
	);
});
