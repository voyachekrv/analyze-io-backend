import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './configuration/test-prepared';
import { TokenInfoDto } from '../src/user/dto/token/token-info.dto';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

/**
 * Тестирования контроллеров пользователя и авторизации
 */
describe('UserController & AuthController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен Пользователя
	 */
	let token;

	/**
	 * Данные о созданном пользователе
	 */
	let userData: TokenInfoDto;

	/**
	 * Данные для входа нового менеджера
	 */
	const testDataUser = {
		email: 'user@gmail.com',
		password: 'test'
	};

	/**
	 * Данные для создания нового менеджера
	 */
	const testDataUserRegistration = {
		...testDataUser,
		name: 'Jill Doe'
	};

	/**
	 * Данные для обновления нового пользователя
	 */
	const testDataUserUpdated = {
		email: 'user@yandex.ru',
		password: 'new-test',
		name: 'Peter Doe'
	};

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
	 * Тест получения данных о пользователе по его токену
	 */
	it('/api/user/auth/whoami (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whoami')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBeDefined();
				expect(body.id).toBeGreaterThan(0);

				userData = body;
			});
	});

	/**
	 * Тест авторизации пользователя
	 */
	it('/api/user/auth/login (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataUser)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				token = body.token;
			});
	});

	/**
	 * Тест получения страницы списка пользователей
	 */
	it('/api/user (GET)', () => {
		return request(app.getHttpServer())
			.get('/user')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест получения всех возможных ролей, которые могут быть заданы пользователю
	 */
	it('/api/user/roles (GET)', () => {
		return request(app.getHttpServer())
			.get('/user/roles')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.roles.length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест получения пользователя по ID
	 */
	it('/api/user/{id} (GET)', () => {
		return request(app.getHttpServer())
			.get(`/user/${userData.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(userData.id);
			});
	});

	/**
	 * Тест на получение пользователя по ID для редактирования
	 */
	it('/api/user/{id}/edit (GET)', () => {
		return request(app.getHttpServer())
			.get(`/user/${userData.id}/edit`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUser.email);
			});
	});

	/**
	 * Тест на обновление пользователя
	 */
	it('/api/user/{id} (PUT)', () => {
		return request(app.getHttpServer())
			.put(`/user/${userData.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(testDataUserUpdated)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUserUpdated.email);
			});
	});

	/**
	 * Тест на добавление аватара
	 */
	it('/api/user/{id}/avatar (PATCH)', () => {
		return request(app.getHttpServer())
			.patch(`/user/${userData.id}/avatar`)
			.set('Authorization', `Bearer ${token}`)
			.attach('file', sampleFileFullPath)
			.expect(200)
			.then(() => {
				const configService = app.get(ConfigService);

				const cwd = process.cwd();
				const uploadsDir = path.resolve(
					cwd,
					configService.get<string>('AIO_FILE_STORAGE'),
					'avatars'
				);

				expect(fs.existsSync(uploadsDir)).toBeTruthy();
				expect(fs.readdirSync(uploadsDir).length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест на удаление пользователя
	 */
	it('/api/user (DELETE)', () => {
		deleteData.ids.push(userData.id);

		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${token}`)
			.send(deleteData)
			.expect(204);
	});
});
