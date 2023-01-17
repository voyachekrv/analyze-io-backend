import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './test-prepared';

describe('UserController & AuthController (root-user) (e2e)', () => {
	let app: INestApplication;

	const oldRoot = { email: 'root@root.com', password: 'toor' };
	const testDataUser = {
		email: 'user@gmail.com',
		password: 'test',
		name: 'User Doe'
	};
	const testDataUserUpdated = {
		email: 'user@yandex.ru',
		password: 'new-test',
		name: 'Mike Doe'
	};

	let rootToken;
	let newUserId;
	let newUserToken;

	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

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

	it('/api/user/auth/whois (POST)', () => {
		return request(app.getHttpServer())
			.post('/user/auth/whois')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.id).toBeDefined();
				newUserId = body.id;
			});
	});

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

	it('/api/user (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${rootToken}`)
			.send({ ids: [newUserId] })
			.expect(204);
	});
});
