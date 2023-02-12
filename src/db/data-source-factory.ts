import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

/**
 * Фабрика конфига подключений рабочей версии приложения
 * @param configService Сервис конфигурации
 * @returns Подготовленные настройки конфига подключений
 */
export const dataSourceFactory = (
	configService: ConfigService
): DataSourceOptions => {
	return {
		type: 'postgres',
		host: configService.get<string>('POSTGRES_HOST'),
		port: Number(configService.get<number>('POSTGRES_PORT')),
		username: configService.get<string>('POSTGRES_USER'),
		password: configService.get<string>('POSTGRES_PASSWORD'),
		database: configService.get<string>('POSTGRES_DB'),
		entities: ['dist/**/*.entity{.ts,.js}'],
		migrations: ['dist/db/migrations/*{.ts,.js}'],
		synchronize: false,
		logging: true,
		cache: false
	};
};

/**
 * Фабрика конфига подключений тестовой версии приложения
 * @param configService Сервис конфигурации
 * @returns Подготовленные настройки конфига подключений
 */
export const dataSourceTestFactory = (
	configService: ConfigService
): DataSourceOptions => {
	return {
		type: 'postgres',
		host: configService.get<string>('POSTGRES_HOST'),
		port: Number(configService.get<number>('POSTGRES_PORT')),
		username: configService.get<string>('POSTGRES_USER'),
		password: configService.get<string>('POSTGRES_PASSWORD'),
		database: configService.get<string>('POSTGRES_DB'),
		entities: ['src/**/*.entity{.ts,.js}'],
		migrations: ['dist/db/migrations/*{.ts,.js}'],
		synchronize: false,
		logging: false,
		cache: false
	};
};
