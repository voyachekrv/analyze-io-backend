import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { testDataSourceOptions } from '../src/db/test-data-source';

export const testNestApplication = async (): Promise<INestApplication> => {
	const dataSourceOptions = testDataSourceOptions;
	dataSourceOptions.entities[0] = 'src/**/*.entity{.ts,.js}';

	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				envFilePath: '.env.test'
			}),
			TypeOrmModule.forRoot(dataSourceOptions),
			UserModule
		]
	}).compile();

	return moduleFixture.createNestApplication();
};
