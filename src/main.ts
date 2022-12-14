import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Prefixes } from './prefixes';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let appPort: number;

const bootstrap = async () => {
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

	const resourcesDir = path.join(process.cwd(), 'resources');

	if (!fs.existsSync(resourcesDir)) {
		fs.mkdirSync(resourcesDir);
	}

	appPort = configService.get('PORT');

	await app.listen(configService.get('PORT'));
};

bootstrap().then(() => {
	Logger.log(`Application started on port ${appPort}`, 'main');
	Logger.log(
		`API Documentation: http://localhost:${process.env.PORT}/${Prefixes.DOCS}`,
		'main'
	);
});
