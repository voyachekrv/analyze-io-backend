import { Module } from '@nestjs/common';
import { DatabaseHealthCheckService } from './database-healthcheck.service';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';

/**
 * Модуль для проверки работоспособности приложения или его отдельных элементов
 */
@Module({
	imports: [TerminusModule, HttpModule, ConfigModule],
	controllers: [HealthController],
	providers: [DatabaseHealthCheckService],
	exports: [DatabaseHealthCheckService]
})
export class HealthCheckModule {}
