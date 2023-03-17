import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './configuration/test-prepared';

/**
 * Тестирования контроллеров пользователя и авторизации
 */
describe('UserController & AuthController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Корректные входные данные для root-пользователя
	 */
	const testDataRight = {
		email: 'root@root.com',
		password: 'toor'
	};

	/**
	 * Некорректные входные данные для root-пользователя
	 */
	const testDataBadPassword = { email: 'root@root.com', password: 'tor' };

	/**
	 * Данные для создания нового root-пользователя
	 */
	const testDataRoot = {
		email: 'root2@gmail.com',
		password: 'testRoot',
		name: 'Root Root'
	};

	/**
	 * Данные для создания нового обычного пользователя
	 */
	const testDataUser = {
		email: 'user@gmail.com',
		password: 'test',
		name: 'Jill Doe'
	};

	/**
	 * Данные для обновления нового обычного пользователя
	 */
	const testDataUserUpdated = {
		email: 'user@yandex.ru',
		password: 'new-test',
		name: 'Peter Doe'
	};

	/**
	 * DTO для удаления существующих пользователей
	 */
	const deleteDataRight = { ids: [] };

	/**
	 * DTO для проверки удаления несуществующих пользователей
	 */
	const deleteDataFailed = { ids: [1, 2] };

	/**
	 * Токен root-пользователя
	 */
	let token;

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
	 * Тест авторизации root-пользователя
	 */
	it('/api/user/auth/login (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataRight)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				token = body.token;
			});
	});

	/**
	 * Тест авторизации root-пользователя с некорректными входными данными
	 */
	it('/api/user/auth/login (POST) - failed', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataBadPassword)
			.expect(401);
	});

	/**
	 * Тест получения данных о пользователе по его токену
	 */
	it('/api/user/auth/whois (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whois')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(1);
			});
	});

	/**
	 * Тест создания пользователя
	 */
	it('/api/user (POST)', () => {
		return request(app.getHttpServer())
			.post('/user')
			.set('Authorization', `Bearer ${token}`)
			.send(testDataRoot)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
			});
	});

	/**
	 * Тест регистрации нового пользователя
	 */
	it('/api/user/auth/registration (POST)', () => {
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
	 * Тест получения данных о новом пользователе по его токену
	 */
	it('/api/user/auth/whois (POST) - for user', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whois')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send({ token: newUserToken })
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				newUserId = body.id;
			});
	});

	/**
	 * Тест получения страницы списка пользователей
	 */
	it('/api/user (GET) - success', () => {
		return request(app.getHttpServer())
			.get('/user?page=0')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.list).toBeDefined();
				expect(body.list.length).toBeGreaterThan(0);
				expect(body.list[0].id).toBe(1);
			});
	});

	/**
	 * Проверка на корректность обработки неправильного номера страницы, если номер страницы не будет числом
	 */
	it('/api/user (GET) - bad request: string page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=a')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

	/**
	 * Проверка на корректность обработки неправильного номера страницы, если номер страницы не будет целым числом
	 */
	it('/api/user (GET) - bad request: float page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=0.5')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

	/**
	 * Проверка на корректность обработки неправильного номера страницы, если номер страницы не будет положительным числом
	 */
	it('/api/user (GET) - bad request: negative page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=-1')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

	/**
	 * Тест получения всех возможных ролей, которые могут быть заданы пользователю
	 */
	it('/api/user/roles (GET)', () => {
		return request(app.getHttpServer())
			.get('/user/roles')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.roles.length).toBeGreaterThan(0);
			});
	});

	/**
	 * Тест получения пользователя по ID
	 */
	it('/api/user/{id} (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/user/${newUserId}`)
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(newUserId);
			});
	});

	/**
	 * Тест на проверку нахождения не существующего в БД пользователя
	 */
	it('/api/user/{id} (GET) - failed', () => {
		return request(app.getHttpServer())
			.get('/user/100')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(404);
	});

	/**
	 * Тест на получение пользователя по ID для редактирования
	 */
	it('/api/user/{id}/edit (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/user/${newUserId}/edit`)
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUser.email);
			});
	});

	/**
	 * Тест на проверку возможности получения не root-пользователем данных о другом пользователе
	 */
	it('/api/user/{id}/edit (GET) - failed', () => {
		return request(app.getHttpServer())
			.get('/user/1/edit')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(403);
	});

	/**
	 * Тест на обновление пользователя
	 */
	it('/api/user/{id} (PUT) - success', () => {
		return request(app.getHttpServer())
			.put(`/user/${newUserId}`)
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(testDataUserUpdated)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.email).toBe(testDataUserUpdated.email);
			});
	});

	/**
	 * Тест на проверку возможности обновления не root-пользователем данных другого пользователя
	 */
	it('/api/user/{id} (PUT) - failed', () => {
		return request(app.getHttpServer())
			.put('/user/1')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(testDataUserUpdated)
			.expect(403);
	});

	/**
	 * Тест на удаление пользователя
	 */
	it('/api/user (DELETE) - success', () => {
		deleteDataRight.ids.push(newUserId);

		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(deleteDataRight)
			.expect(204);
	});

	/**
	 * Тест на возможность удаления не root-пользователем данных другого пользователя
	 */
	it('/api/user (DELETE) - failes', () => {
		deleteDataFailed.ids.push(newUserId);

		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(deleteDataFailed)
			.expect(403);
	});
});
