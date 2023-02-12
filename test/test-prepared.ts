import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { CommerceModule } from '../src/commerce/commerce.module';
import { ResourceModule } from '../src/resource/resource.module';
import { dataSourceTestFactory } from '../src/db/data-source-factory';

export const testNestApplication = async (): Promise<INestApplication> => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				envFilePath: '.env.test'
			}),
			TypeOrmModule.forRootAsync({
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: dataSourceTestFactory
			}),
			UserModule,
			CommerceModule,
			ResourceModule
		]
	}).compile();

	return moduleFixture.createNestApplication();
};
