import { HealthCheckModule } from './healthcheck/healthcheck.module';
import { MonitorScriptModule } from './monitor-script/monitor-script.module';
import { ReportModule } from './report/report.module';
import { DataScientistModule } from './data-scientist/data-scientist.module';
import { AvatarToolsModule } from './avatar-tools/avatar-tools.module';
import { ShopModule } from './shop/shop.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

/**
 * Основной модуль приложения
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env'
		}),
		AvatarToolsModule,
		DataScientistModule,
		UserModule,
		ShopModule,
		ReportModule,
		MonitorScriptModule,
		HealthCheckModule
	]
})
export class AppModule {}
