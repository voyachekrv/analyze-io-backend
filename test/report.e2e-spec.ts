import { INestApplication } from '@nestjs/common';
import { testNestApplication } from './configuration/test-prepared';
import * as request from 'supertest';
import { ReportCreateDto } from '../src/report/dto/report.create.dto';
import { ReportUpdateDto } from '../src/report/dto/report.update.dto';

/**
 * Тестирование контроллеров модуля отчетов
 */
describe('ReportController (e2e)', () => {
	/**
	 * Nest-приложение
	 */
	let app: INestApplication;

	/**
	 * Токен пользователя
	 */
	let userToken;

	/**
	 * Токен менеджера
	 */
	let managerToken;

	/**
	 * Входные данные пользователя
	 */
	const userCredentials = {
		email: 'testuser6@gmail.com',
		password: 'test1'
	};

	/**
	 * Входные данные менеджера
	 */
	const managerCredentials = {
		email: 'testuser2@gmail.com',
		password: 'test1'
	};

	/**
	 * DTO создания отчета
	 */
	const reportCreateDto: ReportCreateDto = new ReportCreateDto();
	reportCreateDto.name = 'Отчет 1';
	reportCreateDto.comment = 'Комментарий 1';
	reportCreateDto.file = '2023_03_21.txt';
	reportCreateDto.payload = '{"foo": "bar"}';

	/**
	 * ID отчета
	 */
	let reportId;

	/**
	 * DTO обновления отчета
	 */
	const reportUpdateDto = new ReportUpdateDto('Отчет 2', 'Комментарий 2');

	/**
	 * Полученный отчет
	 */
	let reportCardDto;

	/**
	 * ID магазина
	 */
	let shopId;

	/**
	 * Создание экземпляра приложения
	 */
	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

	/**
	 * Авторизация аналитика
	 */
	it('/api/user/auth/login (POST) - success (user)', () => {
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
	 * Авторизация менеджера
	 */
	it('/api/user/auth/login (POST) - success (manager)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(managerCredentials)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
				managerToken = body.token;
			});
	});

	/**
	 * Тест создания магазина
	 */
	it('/api/shop (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/shop')
			.set('Authorization', `Bearer ${managerToken}`)
			.send({ name: 'Пятерочка' })
			.expect(201)
			.then(({ body }: request.Response) => {
				shopId = body.id;
				expect(body.id).toBeDefined();
			});
	});

	/**
	 * Тест назначения аналитика на магазин
	 */
	it('/api/shop/{id}/staff (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch(`/shop/${shopId}/staff?operation=add`)
			.set('Authorization', `Bearer ${managerToken}`)
			.send({ dataScientistIds: [7] })
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
			});
	});

	/**
	 * Тест создания отчета
	 */
	it('/api/shop/{id}/report (POST) - success', () => {
		return request(app.getHttpServer())
			.post(`/shop/${shopId}/report`)
			.set('Authorization', `Bearer ${userToken}`)
			.send(reportCreateDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				reportId = body.id;
				expect(body.id).toBeDefined();
			});
	});

	/**
	 * Тест получения списка отчетов
	 */
	it('/api/shop/{id}/report (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}/report`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.length).toBeGreaterThan(0);
				expect(body[0].id).toBe(reportId);
			});
	});

	/**
	 * Тест получения отчета по ID
	 */
	it('/api/shop/{id}/report/{id} (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}/report/${reportId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.id).toBe(reportId);

				reportCardDto = body;
			});
	});

	/**
	 * Тест получения отчета по ID для редактирования
	 */
	it('/api/shop/{id}/report/{id}/edit (GET) - success', () => {
		return request(app.getHttpServer())
			.get(`/shop/${shopId}/report/${reportId}/edit`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(reportCardDto.name);
				expect(body.comment).toBe(reportCardDto.comment);
			});
	});

	/**
	 * Тест обновления отчета
	 */
	it('/api/shop/{id}/report/{id} (PUT) - success', () => {
		return request(app.getHttpServer())
			.put(`/shop/${shopId}/report/${reportId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.send(reportUpdateDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(reportUpdateDto.name);
				expect(body.comment).toBe(reportUpdateDto.comment);
			});
	});

	/**
	 * Тест обновления отчета
	 */
	it('/api/shop/{id}/report/{id} (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch(`/shop/${shopId}/report/${reportId}`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({ payload: { bar: 'foo' } })
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
				expect(body.name).toBe(reportUpdateDto.name);
				expect(body.comment).toBe(reportUpdateDto.comment);
			});
	});

	/**
	 * Тест обновления отчета
	 */
	it('/api/shop/{id}/report/{id}/see (PATCH) - success', () => {
		return request(app.getHttpServer())
			.patch(`/shop/${shopId}/report/${reportId}/see`)
			.set('Authorization', `Bearer ${managerToken}`)
			.expect(204);
	});

	/**
	 * Тест удаления отчета
	 */
	it('/api/shop/{id}/report (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete(`/shop/${shopId}/report`)
			.set('Authorization', `Bearer ${userToken}`)
			.send({ ids: [reportId] })
			.expect(204);
	});
});
