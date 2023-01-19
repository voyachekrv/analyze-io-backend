import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplicationCommerce } from './test-prepared';
import { ShopCreateDto } from '@commerce/dto/shop.create.dto';
import { ShopUpdateDto } from '@commerce/dto/shop.update.dto';

describe('ShopController & ResourceController (e2e)', () => {
	let app: INestApplication;

	let userToken;

	const userCredentials = {
		email: 'testuser1@gmail.com',
		password: 'test1'
	};

	const createDto: ShopCreateDto = {
		name: 'Aliexpress'
	};

	const updateDto: ShopUpdateDto = {
		name: 'Aliexpress'
	};

	let shopId: number;

	let shopUUID: string;

	const deleteData = { ids: [] };

	beforeEach(async () => {
		app = await testNestApplicationCommerce();
		await app.init();
	});

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

	it('/api/resource/monitor/monitor.js', () => {
		return request(app.getHttpServer())
			.get('/resource/monitor/monitor.js')
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body).toBeDefined();
			});
	});

	it('/api/shop (DELETE) - success', () => {
		deleteData.ids.push(shopId);

		return request(app.getHttpServer())
			.delete('/shop')
			.set('Authorization', `Bearer ${userToken}`)
			.send(deleteData)
			.expect(204);
	});
});
