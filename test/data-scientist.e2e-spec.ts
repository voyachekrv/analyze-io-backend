import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './configuration/test-prepared';

/**
 * Тестирования контроллеров аналитиков на магазине
 */
describe('DataScientistController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен Менеджера 1
	 */
	let manager1Token;

	/**
	 * Токен Менеджера 2
	 */
	let manager2Token;

	/**
	 * ID Менеджера 2
	 */
	let manager2Id;

	/**
	 * ID аналитика
	 */
	let dataScientistId;

	/**
	 * Данные для создания нового менеджера 1
	 */
	const testManager1Registration = {
		email: 'data_scientist_manager_1@gmail.com',
		password: 'test',
		name: 'Data Scientist Manager 1'
	};

	/**
	 * Данные для создания нового менеджера 2
	 */
	const testManager2Registration = {
		email: 'data_scientist_manager_2@gmail.com',
		password: 'test',
		name: 'Data Scientist Manager 2'
	};

	/**
	 * Данные для создания нового аналитика
	 */
	const testDataScientistRegistration = {
		email: 'data_scientist_1@gmail.com',
		password: 'test',
		name: 'Data Scientist 1'
	};

	/**
	 * Создание экземпляра приложения
	 */
	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

	/**
	 * Тест авторизации менеджера 1
	 */
	it('/api/user/auth/registration (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/registration')
			.send(testManager1Registration)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				manager1Token = body.token;
			});
	});

	/**
	 * Тест авторизации менеджера 2
	 */
	it('/api/user/auth/registration (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/registration')
			.send(testManager2Registration)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				manager2Token = body.token;
			});
	});

	/**
	 * Тест получения данных о менеджере 1 по его токену
	 */
	it('/api/user/auth/whoami (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whoami')
			.set('Authorization', `Bearer ${manager2Token}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBeDefined();
				expect(body.id).toBeGreaterThan(0);

				manager2Id = body.id;
			});
	});

	/**
	 * Создание аналитиков
	 */
	it('/api/data-scientist (POST)', () => {
		return request(app.getHttpServer())
			.post('/data-scientist')
			.set('Authorization', `Bearer ${manager1Token}`)
			.send(testDataScientistRegistration)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBeDefined();
				expect(body.id).toBeGreaterThan(0);

				dataScientistId = body.id;
			});
	});

	/**
	 * Переназначение аналитиков другому менеджеру
	 */
	it('/api/data-scientist (PATCH)', () => {
		return request(app.getHttpServer())
			.patch('/data-scientist')
			.set('Authorization', `Bearer ${manager1Token}`)
			.send({
				managerId: manager2Id,
				subordinates: [dataScientistId]
			})
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body[0].subordinate.id).toBe(dataScientistId);
				expect(body[0].newManager.id).toBe(manager2Id);
			});
	});

	/**
	 * Удаление аналитиков
	 */
	it('/api/data-scientist (DELETE)', () => {
		return request(app.getHttpServer())
			.delete('/data-scientist')
			.set('Authorization', `Bearer ${manager2Token}`)
			.send({
				ids: [dataScientistId]
			})
			.expect(204);
	});
});
