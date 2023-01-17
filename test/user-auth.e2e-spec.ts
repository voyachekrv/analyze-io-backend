import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testNestApplication } from './test-prepared';

describe('UserController & AuthController (e2e)', () => {
	let app: INestApplication;

	const testDataRight = {
		email: 'root@root.com',
		password: 'toor'
	};
	const testDataBadPassword = { email: 'root@root.com', password: 'tor' };

	const testDataRoot = {
		email: 'root2@gmail.com',
		password: 'testRoot',
		name: 'Root Root'
	};
	const testDataUser = {
		email: 'user@gmail.com',
		password: 'test',
		name: 'Jill Doe'
	};
	const testDataUserUpdated = {
		email: 'user@yandex.ru',
		password: 'new-test',
		name: 'Peter Doe'
	};
	const deleteDataRight = { ids: [] };
	const deleteDataFailed = { ids: [1, 2] };

	let token;
	let newUserId;
	let newUserToken;

	beforeEach(async () => {
		app = await testNestApplication();
		await app.init();
	});

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

	it('/api/user/auth/login (POST) - failed', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataBadPassword)
			.expect(401);
	});

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

	it('/api/user (GET) - bad request: string page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=a')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

	it('/api/user (GET) - bad request: float page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=0.5')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

	it('/api/user (GET) - bad request: negative page number', () => {
		return request(app.getHttpServer())
			.get('/user?page=-1')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(400);
	});

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

	it('/api/user/{id} (GET) - failed', () => {
		return request(app.getHttpServer())
			.get('/user/100')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(404);
	});

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

	it('/api/user/{id}/edit (GET) - failed', () => {
		return request(app.getHttpServer())
			.get('/user/1/edit')
			.set('Authorization', `Bearer ${newUserToken}`)
			.expect(403);
	});

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

	it('/api/user/{id} (PUT) - failed', () => {
		return request(app.getHttpServer())
			.put('/user/1')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(testDataUserUpdated)
			.expect(403);
	});

	it('/api/user (DELETE) - success', () => {
		deleteDataRight.ids.push(newUserId);

		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(deleteDataRight)
			.expect(204);
	});

	it('/api/user (DELETE) - failes', () => {
		deleteDataFailed.ids.push(newUserId);

		return request(app.getHttpServer())
			.delete('/user')
			.set('Authorization', `Bearer ${newUserToken}`)
			.send(deleteDataFailed)
			.expect(403);
	});
});
