import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Создание Swagger-конфига
 * @returns Swagger-конфиг
 */
const buildSwaggerConfig = () =>
	new DocumentBuilder()
		.setTitle('Analyze.io - Application Service')
		.setDescription(
			`
	Бэкенд системы анализа поведения пользователя интернет-магазина Analyze.io
	`
		)
		.setVersion(process.env.npm_package_version)
		.addBearerAuth({ in: 'header', type: 'http', bearerFormat: 'JWT' })
		.build();

/**
 * Инициализация Swagger-документа
 * @param app Nest-приложение
 * @returns Swagger-документ
 */
export const createSwaggerDocument = (
	app: NestExpressApplication
): OpenAPIObject => SwaggerModule.createDocument(app, buildSwaggerConfig());

/**
 * Создание директории для загружаемых на сервер медиа-файлов
 * @param pathToDir Относительный путь к директории для загрузки файлов
 */
export const mkResourcesDir = (pathToDir: string): void => {
	const resourcesDir = path.join(process.cwd(), pathToDir);

	if (!fs.existsSync(resourcesDir)) {
		fs.mkdirSync(resourcesDir);
	}
};
