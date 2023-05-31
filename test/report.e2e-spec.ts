import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './configuration/test-prepared';

/**
 * Тестирования контроллеров отчета
 */
describe('ReportController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен Менеджера
	 */
	let managerToken;

	/**
	 * ID магазина
	 */
	let shopId;

	/**
	 * ID отчета
	 */
	let reportId;

	/**
	 * Данные для создания нового менеджера
	 */
	const testManagerRegistration = {
		email: 'report_tester@gmail.com',
		password: 'test',
		name: 'Report Tester'
	};

	/**
	 * Данные для создания нового магазина
	 */
	const shopCreateDto = { name: 'Report Shop Ltd.' };

	/**
	 * Данные для создания отчета
	 */
	const reportCreateDto = {
		name: 'Report 1',
		file: '2023-03-20_Report1.csv',
		comment: 'Comment 1',
		payload: '{ "foo": null }'
	};

	/**
	 * Данные для обновления отчета
	 */
	const reportUpdateDto = {
		name: 'Report 2',
		comment: 'Comment 2'
	};

	/**
	 * Создание экземпляра приложения
	 */
	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

	/**
	 * Тест авторизации менеджера
	 */
	it('/api/user/auth/registration (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/registration')
			.send(testManagerRegistration)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				managerToken = body.token;
			});
	});

	/**
	 * Создание магазина
	 */
	it('/api/shop (POST)', () => {
		return request(app.getHttpServer())
			.post('/shop')
			.set('Authorization', `Bearer ${managerToken}`)
			.send(shopCreateDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				shopId = body.id;
			});
	});

	/**
	 * Создание отчета
	 */
	it('/api/report (POST)', () => {
		return request(app.getHttpServer())
			.post('/report')
			.set('Authorization', `Bearer ${managerToken}`)
			.send({
				shopId,
				...reportCreateDto
			})
			.expect(201)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				reportId = body.id;
			});
	});

	/**
	 * Список отчетов
	 */
	it('/api/report (GET)', () => {
		return request(app.getHttpServer())
			.get('/report')
			.set('Authorization', `Bearer ${managerToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.length).toBeGreaterThan(0);
				expect(body[0].id).toBe(reportId);
				expect(body[0].name).toBe(reportCreateDto.name);
			});
	});

	/**
	 * Карточка отчета
	 */
	it('/api/report/{id} (GET)', () => {
		return request(app.getHttpServer())
			.get(`/report/${reportId}`)
			.set('Authorization', `Bearer ${managerToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(reportId);
				expect(body.name).toBe(reportCreateDto.name);
				expect(body.shop.id).toBe(shopId);
			});
	});

	/**
	 * DTO Обновления отчета
	 */
	it('/api/report/{id}/edit (GET)', () => {
		return request(app.getHttpServer())
			.get(`/report/${reportId}/edit`)
			.set('Authorization', `Bearer ${managerToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(reportCreateDto.name);
				expect(body.comment).toBe(reportCreateDto.comment);
			});
	});

	/**
	 * Обновление отчета
	 */
	it('/api/report/{id} (PUT)', () => {
		return request(app.getHttpServer())
			.put(`/report/${reportId}`)
			.set('Authorization', `Bearer ${managerToken}`)
			.send(reportUpdateDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(reportId);
				expect(body.name).toBe(reportUpdateDto.name);
				expect(body.comment).toBe(reportUpdateDto.comment);
			});
	});

	/**
	 * Обновление файла отчета
	 */
	it('/api/report/{id}/edit (PATCH)', () => {
		return request(app.getHttpServer())
			.patch(`/report/${reportId}`)
			.set('Authorization', `Bearer ${managerToken}`)
			.send({
				payload: '{ "foo": "bar" }'
			})
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.id).toBe(reportId);
				expect(body.name).toBe(reportUpdateDto.name);
				expect(body.comment).toBe(reportUpdateDto.comment);
			});
	});

	/**
	 * Тест просмотра менеджером отчета
	 */
	it('/api/report/{id}/see (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch(`/report/${reportId}/see`)
			.set('Authorization', `Bearer ${managerToken}`)
			.expect(204);
	});

	/**
	 * Тест удаления отчета
	 */
	it('/api/report (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/report')
			.set('Authorization', `Bearer ${managerToken}`)
			.send({ ids: [reportId] })
			.expect(204);
	});
});
