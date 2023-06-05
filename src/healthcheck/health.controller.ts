/* eslint-disable array-bracket-newline */
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	HttpHealthIndicator,
	MemoryHealthIndicator
} from '@nestjs/terminus';

/**
 * Контролллер для проверки работоспособности приложения или его отдельных элементов
 */
@Controller('health')
export class HealthController {
	/**
	 * Контролллер для проверки работоспособности приложения или его отдельных элементов
	 * @param health Handles Health Checks which can be used in Controllers
	 * @param http The HTTPHealthIndicator contains health indicators which are used for health checks related to HTTP requests
	 * @param configService Сервис конфигурации
	 * @param disk The DiskHealthIndicator contains checks which are related to the disk storage of the current running machine
	 * @param memory The MemoryHealthIndicator contains checks which are related to the memory storage of the current running machine
	 */
	constructor(
		private readonly health: HealthCheckService,
		private readonly http: HttpHealthIndicator,
		private readonly configService: ConfigService,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator
	) {}

	/**
	 * HealthCheck для сервера аналитической БД
	 * @returns Результат HealthCheck-a для сервера аналитической БД
	 */
	@Get('adb-server')
	@HealthCheck()
	public async checkAdbServer(): Promise<HealthCheckResult> {
		return await this.health.check([
			() =>
				this.http.pingCheck(
					'adb.analyze.io',
					`${this.configService.get<string>(
						'AIO_ADB_SERVER_ADDR'
					)}api/health`
				)
		]);
	}

	/**
	 * HealthCheck для диска
	 * @returns Результат HealthCheck-a диска
	 */
	@Get('storage')
	@HealthCheck()
	public async checkStorage(): Promise<HealthCheckResult> {
		return await this.health.check([
			() =>
				this.disk.checkStorage('storage', {
					path: '/',
					threshold: 250 * 1024 * 1024 * 1024
				})
		]);
	}

	/**
	 * HealthCheck для памяти
	 * @returns Результат HealthCheck-a памяти
	 */
	@Get('memory')
	@HealthCheck()
	public async check(): Promise<HealthCheckResult> {
		return await this.health.check([
			() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
			() => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024)
		]);
	}
}
