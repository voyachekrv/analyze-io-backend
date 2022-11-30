import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	const testDataRight = { email: 'root@localhost.com', password: 'toor' };
	const testDataBadPassword = {
		email: 'root@localhost.com',
		password: 'tor'
	};

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/api/user/auth/login (POST) - success', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataRight)
			.expect(200)
			.then(({ body }: request.Response) => {
				expect(body.token).toBeDefined();
			});
	});

	it('/api/user/auth/login (POST) - failed', () => {
		return request(app.getHttpServer())
			.post('/user/auth/login')
			.send(testDataBadPassword)
			.expect(401);
	});
});
