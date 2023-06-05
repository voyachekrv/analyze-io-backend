import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Сервис для проверки подключения к базе данных
 */
@Injectable()
export class DatabaseHealthCheckService {
	/**
	 * Проверка подключения к базе данных
	 * @returns Есть ли подключение
	 */
	public async getDatabaseState(): Promise<boolean> {
		try {
			const prisma = new PrismaClient();

			const result = await prisma.$queryRaw(Prisma.sql`SELECT 1`);

			if (result) {
				return true;
			}

			return false;
		} catch (e) {
			Logger.error(e.message.trim(), this.constructor.name);

			return false;
		}
	}
}
