import { Module } from '@nestjs/common';
import { DatabaseHealthCheckService } from './database-healthcheck.service';

/**
 * Модуль для проверки работоспособности приложения или его отдельных элементов
 */
@Module({
	imports: [],
	controllers: [],
	providers: [DatabaseHealthCheckService],
	exports: [DatabaseHealthCheckService]
})
export class HealthCheckModule {}
