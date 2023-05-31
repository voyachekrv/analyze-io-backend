import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './configuration/test-prepared';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

/**
 * Тестирования контроллеров магазина
 */
describe('ShopController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен Пользователя
	 */
	let token;

	/**
	 * ID нового магазина
	 */
	let shopId;

	/**
	 * Данные для входа нового менеджера
	 */
	const testDataUser = {
		email: 'shop_tester@gmail.com',
		password: 'test'
	};

	/**
	 * Данные для создания нового менеджера
	 */
	const testDataUserRegistration = {
		...testDataUser,
		name: 'Shop Tester'
	};

	/**
	 * Данные для создания нового магазина
	 */
	const shopCreateDto = { name: 'Horns & Hooves Ltd.' };

	/**
	 * Данные для обновления нового магазина
	 */
	const shopUpdateDto = { name: 'Something Ltd.' };

	/**
	 * DTO для удаления существующих пользователей
	 */
	const deleteData = { ids: [] };

	/**
	 * Тестовый аватар
	 */
	const sampleFilename = 'sample.png';

	/**
	 * Путь к тестовому Тестовый аватар
	 */
	const sampleFileFullPath = path.join(
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
	 * Тест авторизации пользователя
	 */
	it('/api/user/auth/registration (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/registration')
			.send(testDataUserRegistration)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				token = body.token;
			});
	});

	/**
	 * Создание магазина
	 */
	it('/api/shop (POST)', () => {
		return request(app.getHttpServer())
			.post('/shop')
			.set('Authorization', `Bearer ${token}`)
			.send(shopCreateDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				shopId = body.id;
			});
	});

	/**
	 * Получение списка магазинов
	 */
	it('/api/shop (GET)', () => {
		return request(app.getHttpServer())
			.get('/shop')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body[0]).toBeDefined();
				expect(body[0].id).toBeDefined();
				expect(body[0].id).toBe(shopId);
				expect(body[0].name).toBe(shopCreateDto.name);
			});
	});

	/**
	 * Получение карточки магазина
	 */
	it('/api/shop/{id} (GET)', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBeDefined();
				expect(body.name).toBe(shopCreateDto.name);
			});
	});

	/**
	 * Получение DTO обновления магазина
	 */
	it('/api/shop/{id}/edit (GET)', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}/edit`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(shopCreateDto.name);
			});
	});

	/**
	 * Обновление магазина
	 */
	it('/api/shop/{id}/edit (PUT)', () => {
		return request(app.getHttpServer())
			.put(`/shop/${shopId}`)
			.set('Authorization', `Bearer ${token}`)
			.send(shopUpdateDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(shopUpdateDto.name);
			});
	});

	/**
	 * Тест на добавление аватара
	 */
	it('/api/shop/{id}/avatar (PATCH)', () => {
		return request(app.getHttpServer())
			.patch(`/shop/${shopId}/avatar`)
			.set('Authorization', `Bearer ${token}`)
			.attach('file', sampleFileFullPath)
			.expect(200)
			.then(() => {
				const configService = app.get(ConfigService);

				const cwd = process.cwd();
				const uploadsDir = path.resolve(
					cwd,
					configService.get<string>('AIO_FILE_STORAGE'),
					'shop-avatars'
				);

				expect(fs.existsSync(uploadsDir)).toBeTruthy();
				expect(fs.readdirSync(uploadsDir).length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест на удаление магазина
	 */
	it('/api/shop (DELETE)', () => {
		deleteData.ids.push(shopId);

		return request(app.getHttpServer())
			.delete('/shop')
			.set('Authorization', `Bearer ${token}`)
			.send(deleteData)
			.expect(204);
	});
});
