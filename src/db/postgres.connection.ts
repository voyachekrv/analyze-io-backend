import { ConfigService } from '@nestjs/config';

/**
 * Подключение к PostgreSQL
 * @param configService Сервис доступа к конфигу
 * @returns Подключение к БД
 */
export const postgressConnection = (configService: ConfigService) => {
	return {
		config: {
			client: 'postgres',
			version: '13.8',
			useNullAsDefault: true,
			connection: {
				host: configService.get<string>('POSTGRES_HOST'),
				port: configService.get<number>('POSTGRES_PORT'),
				user: configService.get<string>('POSTGRES_USER'),
				password: configService.get<string>('POSTGRES_PASSWORD'),
				database: configService.get<string>('POSTGRES_DB')
			},
			pool: {
				min: 1,
				max: 10
			}
		}
	};
};
