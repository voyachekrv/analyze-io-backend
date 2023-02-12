import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './test-prepared';

/**
 * Тест работы root-пользователя
 */
describe('UserController & AuthController (root-user) (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * "Старые" данные для входа root-пользователя
	 */
	const oldRoot = { email: 'root@root.com', password: 'toor' };

	/**
	 * Данные для входа обычного пользователя
	 */
	const testDataUser = {
		email: 'user@gmail.com',
		password: 'test',
		name: 'User Doe'
	};

	/**
	 * Обновленные данные для входа обычного пользователя
	 */
	const testDataUserUpdated = {
		email: 'user@yandex.ru',
		password: 'new-test',
		name: 'Mike Doe'
	};

	/**
	 * Токен root-пользователя
	 */
	let rootToken;

	/**
	 * ID созданного пользователя
	 */
	let newUserId;

	/**
	 * Токен созданного пользователя
	 */
	let newUserToken;

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
	it('/api/user/auth/login (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(oldRoot)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				rootToken = body.token;
			});
	});

	/**
	 * Тест регистрациии пользователя
	 */
	it('/api/user/auth/registration (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/registration')
			.send(testDataUser)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				newUserToken = body.token;
			});
	});

	/**
	 * Тест получения данных о пользователе по его токену
	 */
	it('/api/user/auth/whois (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whois')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				newUserId = body.id;
			});
	});

	/**
	 * Тест получения пользователя по его ID для редактирования
	 */
	it('/api/user/{id}/edit (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/user/${newUserId}/edit`)
			.set('Authorization', `Bearer ${rootToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUser.email);
			});
	});

	/**
	 * Тест обновления пользователя
	 */
	it('/api/user/{id} (PUT) - success', () => {
		return request(app.getHttpServer())
			.put(`/user/${newUserId}`)
			.set('Authorization', `Bearer ${rootToken}`)
			.send(testDataUserUpdated)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUserUpdated.email);
			});
	});

	/**
	 * Тест удаления пользователя
	 */
	it('/api/user (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${rootToken}`)
			.send({ ids: [newUserId] })
			.expect(204);
	});
});
