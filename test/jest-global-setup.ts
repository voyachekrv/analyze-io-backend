import { exec } from 'child_process';

/**
 * Исполнение консольной команды запуска миграции тестовой базы данных
 * @returns Promise-объект
 */
const promisifyProcess = () =>
	new Promise((resolve, reject) => {
		exec('npm run migration:run-test', err => {
			if (err) {
				reject(err);
			} else {
				resolve(null);
			}
		});
	});

/**
 * Настройки, производящиеся перед началом процесса тестирования
 */
const jestGlobalSetup = async () => {
	await promisifyProcess();
};

export default jestGlobalSetup;
