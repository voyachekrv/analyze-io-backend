import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './test-prepared';
import { ShopCreateDto } from '@commerce/dto/shop.create.dto';
import { ShopUpdateDto } from '@commerce/dto/shop.update.dto';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

/**
 * Тестирование контроллеров модуля коммерции и ресурсов
 */
describe('ShopController & ResourceController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен пользователя
	 */
	let userToken;

	/**
	 * Токен root-пользователя
	 */
	let rootToken;

	/**
	 * Входные данные пользователя
	 */
	const userCredentials = {
		email: 'testuser1@gmail.com',
		password: 'test1'
	};

	/**
	 * Входные данные root-пользователя
	 */
	const rootCredentials = {
		email: 'root@root.com',
		password: 'toor'
	};

	/**
	 * DTO создания магазина
	 */
	const createDto: ShopCreateDto = {
		name: 'Aliexpress'
	};

	/**
	 * DTO обновления магазина
	 */
	const updateDto: ShopUpdateDto = {
		name: 'Wildberries'
	};

	/**
	 * ID магазина в оперативной базе данных
	 */
	let shopId: number;

	/**
	 * ID магазина в аналитической базе данных
	 */
	let shopUUID: string;

	/**
	 * DTO удаления
	 */
	const deleteData = { ids: [] };

	const sampleFilename = 'monitor.js';
	const sampleFileFullPath = path.resolve(
		process.cwd(),
		'test',
		'sample',
		sampleFilename
	);

	/**
	 * Создание экземпляра приложения
	 */
	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

	/**
	 * Авторизация пользователя
	 */
	it('/api/user/auth/login (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(userCredentials)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				userToken = body.token;
			});
	});

	/**
	 * Авторизация пользователя
	 */
	it('/api/user/auth/login (POST) - success (root)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(rootCredentials)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				rootToken = body.token;
			});
	});

	/**
	 * Тест создания магазина
	 */
	it('/api/shop (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/shop')
			.set('Authorization', `Bearer ${userToken}`)
			.send(createDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				shopId = body.id;
				expect(body.id).toBeDefined();
			});
	});

	/**
	 * Тест получения списка магазинов
	 */
	it('/api/shop (GET) - success', () => {
		return request(app.getHttpServer())
			.get('/shop?page=0')
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.list).toBeDefined();
				expect(body.list.length).toBeGreaterThan(0);
				expect(body.list[0].id).toBe(shopId);
			});
	});

	/**
	 * Тест получения магазина по ID
	 */
	it('/api/shop/{id} (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(shopId);
				expect(body.name).toEqual(createDto.name);
				expect(body.uuid).toBeDefined();
				expect(body.uuid.length).toBeDefined();
				expect(body.uuid.length).toBeGreaterThan(0);

				shopUUID = body.uuid;
			});
	});

	/**
	 * Тест получения магазина по ID для редактирования
	 */
	it('/api/shop/{id}/edit (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}/edit`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toEqual(createDto.name);
			});
	});

	/**
	 * Тест обновления магазина
	 */
	it('/api/shop/{id} (PUT) - success', () => {
		return request(app.getHttpServer())
			.put(`/shop/${shopId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.send(updateDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(updateDto.name);
			});
	});

	/**
	 * Тест получения строки подключения к скрипту мониторинга
	 */
	it('/api/resource/monitor/connection-string/{uuid} (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/resource/monitor/connection-string/${shopUUID}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.connectionString).toBeDefined();
			});
	});

	/**
	 * Тест загрузки исполняемого файла скрипта на сервер
	 */
	it('/api/resource/monitor (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/resource/monitor')
			.set('Authorization', `Bearer ${rootToken}`)
			.attach('file', sampleFileFullPath, {
				contentType: 'text/javascript'
			})
			.expect(200)
			.then(() => {
				const configService = app.get(ConfigService);

				const cwd = process.cwd();
				const uploadsDir = path.resolve(
					cwd,
					configService.get<string>('AIO_FILE_STORAGE')
				);

				expect(fs.existsSync(uploadsDir)).toBeTruthy();
				expect(fs.readdirSync(uploadsDir).length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест получения скрипта мониторинга
	 */
	it('/api/resource/monitor/monitor.js', () => {
		return request(app.getHttpServer())
			.get('/resource/monitor/monitor.js')
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
			});
	});

	/**
	 * Тест удаления магазина
	 */
	it('/api/shop (DELETE) - success', () => {
		deleteData.ids.push(shopId);

		return request(app.getHttpServer())
			.delete('/shop')
			.set('Authorization', `Bearer ${userToken}`)
			.send(deleteData)
			.expect(204);
	});
});
