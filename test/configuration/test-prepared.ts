import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarToolsModule } from '../../src/avatar-tools/avatar-tools.module';
import { DataScientistModule } from '../../src/data-scientist/data-scientist.module';
import { MonitorScriptModule } from '../../src/monitor-script/monitor-script.module';
import { ReportModule } from '../../src/report/report.module';
import { ShopModule } from '../../src/shop/shop.module';
import { UserModule } from '../../src/user/user.module';

/**
 * Сборка тестового экземпляра приложения
 * @returns Тестовый экземпляр приложения
 */
export const testNestApplication = async (): Promise<INestApplication> => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				envFilePath: '.env.test'
			}),
			AvatarToolsModule,
			DataScientistModule,
			UserModule,
			ShopModule,
			ReportModule,
			MonitorScriptModule
		]
	}).compile();

	return moduleFixture.createNestApplication();
};
