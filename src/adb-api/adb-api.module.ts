import { HttpModule } from '@nestjs/axios';
import { AdbApiService } from './adb-api.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Модуль для взаимодействия с API сервера аналитической БД
 */
@Module({
	imports: [HttpModule, ConfigModule],
	controllers: [],
	providers: [AdbApiService],
	exports: [AdbApiService]
})
export class AdbApiModule {}
