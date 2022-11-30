import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Prefixes } from './prefixes';
import * as fs from 'fs';
import * as path from 'path';

let appPort: number;

const bootstrap = async () => {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true
	});
	const configService = app.get(ConfigService);

	app.setGlobalPrefix(Prefixes.GLOBAL);

	const resourcesDir = path.join(process.cwd(), 'resources');

	if (!fs.existsSync(resourcesDir)) {
		fs.mkdirSync(resourcesDir);
	}

	appPort = configService.get('PORT');

	await app.listen(configService.get('PORT'));
};

bootstrap().then(() => {
	Logger.log(`Application started on port ${appPort}`, 'main');
});
