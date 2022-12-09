import { exec } from 'child_process';

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

const jestGlobalSetup = async () => {
	await promisifyProcess();
};

export default jestGlobalSetup;
