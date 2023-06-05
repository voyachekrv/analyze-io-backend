import { exec } from 'child_process';

/**
 * Запуск дочернего процесса без вывода результата
 * @returns Promise-объект
 */
export const promisifyProcessNoOutput = (command: string) =>
	new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				console.error(stderr.trim());
				resolve(stdout.trim());
			}
		});
	});

/**
 * Запуск дочернего процесса с выводом результата
 * @returns Promise-объект
 */
export const promisifyProcess = (command: string) =>
	new Promise((resolve, reject) => {
		promisifyProcessNoOutput(command)
			.then(result => {
				console.log(result);
				resolve(null);
			})
			.catch(e => {
				console.error(e.message);
				reject(e);
			});
	});
