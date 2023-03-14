import { INestApplication } from '@nestjs/common';
import { testNestApplication } from './test-prepared';
import * as request from 'supertest';
import { UserCreateDto } from '../src/user/dto/user.create.dto';

/**
 * Тестирование контроллеров модуля аналитиков
 */
describe('DataScientistController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен пользователя
	 */
	let userToken;

	let userToken2;

	let user2Id;

	/**
	 * Входные данные пользователя
	 */
	const userCredentials = {
		email: 'testuser1@gmail.com',
		password: 'test1'
	};

	const userCredentials2 = {
		email: 'testuser2@gmail.com',
		password: 'test1'
	};

	const dataScientistDto: UserCreateDto = new UserCreateDto();
	dataScientistDto.email = 'kkujou@gmail.com';
	dataScientistDto.password = 'test1';
	dataScientistDto.name = 'Karen Kujou';

	let dataScientistId;

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
	it('/api/user/auth/login (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(userCredentials2)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				userToken2 = body.token;
			});
	});

	it('/api/user/auth/whois (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whois')
			.set('Authorization', `Bearer ${userToken2}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				user2Id = body.id;
			});
	});

	it('/api/data-scientist (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/data-scientist')
			.set('Authorization', `Bearer ${userToken}`)
			.send(dataScientistDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				dataScientistId = body.id;
				expect(body.id).toBeDefined();
			});
	});

	it('/api/data-scientist (GET) - success', () => {
		return request(app.getHttpServer())
			.get('/data-scientist')
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.length).toBeDefined();
				expect(body.length).toBeGreaterThan(0);
			});
	});

	it('/api/data-scientist/{id} (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/data-scientist/${dataScientistId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.email).toBeDefined();
				expect(body.email).toBe(dataScientistDto.email);
				expect(body.name).toBeDefined();
				expect(body.name).toBe(dataScientistDto.name);
			});
	});

	it('/api/data-scientist (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch('/data-scientist')
			.set('Authorization', `Bearer ${userToken}`)
			.send({
				managerId: user2Id,
				subordinates: [dataScientistId]
			})
			.expect(204);
	});

	it('/api/data-scientist/{id} (GET) - test with new manager', () => {
		return request(app.getHttpServer())
			.get(`/data-scientist/${dataScientistId}`)
			.set('Authorization', `Bearer ${userToken2}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.email).toBeDefined();
				expect(body.email).toBe(dataScientistDto.email);
				expect(body.name).toBeDefined();
				expect(body.name).toBe(dataScientistDto.name);
			});
	});

	it('/api/data-scientist (PATCH) - success', () => {
		return request(app.getHttpServer())
			.delete('/data-scientist')
			.set('Authorization', `Bearer ${userToken}`)
			.send({ ids: [dataScientistId] })
			.expect(204);
	});
});
