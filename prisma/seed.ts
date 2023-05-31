import { PrismaClient, UserRole } from '@prisma/client';
import { CryptoUtils } from '../src/utils/crypto-utils';
import * as dotenv from 'dotenv';

const prisma = new PrismaClient();

/**
 * Запуск вставки начальных данных
 */
const main = async () => {
	dotenv.config();

	const cryptoUtils = new CryptoUtils(process.env.AIO_PRIVATE_KEY);

	const manager1 = await prisma.user.create({
		data: {
			email: 'testuser1@gmail.com',
			password: cryptoUtils.encrypt('test1'),
			role: UserRole.DATA_SCIENCE_MANAGER,
			name: 'John Doe'
		}
	});

	const user1 = await prisma.user.create({
		data: {
			email: 'testuser2@gmail.com',
			password: cryptoUtils.encrypt('test1'),
			role: UserRole.DATA_SCIENTIST,
			name: 'Усаги Цукино',
			manager: {
				connect: {
					email: 'testuser1@gmail.com'
				}
			}
		}
	});

	const user2 = await prisma.user.create({
		data: {
			email: 'testuser3@gmail.com',
			password: cryptoUtils.encrypt('test1'),
			role: UserRole.DATA_SCIENTIST,
			name: 'Roman Vojáček',
			manager: {
				connect: {
					email: 'testuser1@gmail.com'
				}
			}
		}
	});

	const shop1 = await prisma.shop.create({
		data: {
			uuid: '71c89335-a334-4f9f-81d4-ca98ef927029',
			name: 'Aliexpress',
			manager: {
				connect: { email: 'testuser1@gmail.com' }
			}
		}
	});

	const analystOnShop1 = await prisma.analystsOnShop.create({
		data: {
			analyst: {
				connect: { email: 'testuser2@gmail.com' }
			},
			shop: {
				connect: { uuid: '71c89335-a334-4f9f-81d4-ca98ef927029' }
			}
		}
	});

	const analystOnShop2 = await prisma.analystsOnShop.create({
		data: {
			analyst: {
				connect: { email: 'testuser3@gmail.com' }
			},
			shop: {
				connect: { uuid: '71c89335-a334-4f9f-81d4-ca98ef927029' }
			}
		}
	});

	console.log(manager1);
	console.log(user1);
	console.log(user2);
	console.log(shop1);
	console.log(analystOnShop1);
	console.log(analystOnShop2);
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
