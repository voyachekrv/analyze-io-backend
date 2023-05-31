import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Конфигурация JWT-модуля
 * @param configService Сервис конфигурации
 * @returns Опции JWT-модуля
 */
export const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
	return {
		secret: configService.get<string>('AIO_PRIVATE_KEY') || 'SECRET',
		signOptions: {
			expiresIn: '48h'
		}
	};
};
