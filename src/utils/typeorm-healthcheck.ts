import { DataSource } from 'typeorm';

/**
 * Healthcheck для базы данных
 * @param dataSource Данные для подключения в БД
 * @returns Произошло ли подключение
 */
export const typeOrmHealthCheck = async (dataSource: DataSource) => {
	try {
		const source = await dataSource.initialize();
		return source.isInitialized;
	} catch (e) {
		setTimeout(async () => {
			await typeOrmHealthCheck(dataSource);
		}, 3000);
	}
};
