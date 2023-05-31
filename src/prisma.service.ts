import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Сервис для работы с экземпляром Prisma-подключения
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	/**
	 * Подключение Prisma к базе данных
	 */
	public async onModuleInit(): Promise<void> {
		await this.$connect();
	}

	/**
	 * Обработка события выхода из приложения и закрытие подключения Prisma
	 * @param app Приложение
	 */
	public async enableShutdownHooks(app: INestApplication): Promise<void> {
		await this.$on('beforeExit', async () => {
			await app.close();
		});
	}
}
