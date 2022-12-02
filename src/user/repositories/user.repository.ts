/* eslint-disable newline-per-chained-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'util';
import { InjectKnex, Knex } from 'nestjs-knex';
import { User } from '../entities/user.entity';
import { UserStrings } from '../user.strings';

/**
 * Репозиторий для сущности "Пользователь"
 */
@Injectable()
export class UserRepository {
	constructor(@InjectKnex() private readonly knex: Knex) {}

	/**
	 * Получение всех экземпляров сущности "Пользователь"
	 * @returns Список пользователей
	 */
	public async find(): Promise<User[]> {
		return (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')) as User[];
	}

	/**
	 * Сохранение экземпляра сущности "Пользователь"
	 * @param user Сущность "Пользователь"
	 * @returns Созданная сущность с присвоенным ID
	 */
	public async save(user: User): Promise<User> {
		const newEntityId = (
			await this.knex
				.withSchema('usr')
				.insert(
					{
						email: user.email,
						password: user.password,
						role: user.role
					},
					['id']
				)
				.into('user')
		)[0].id as number;

		return await this.findOne(newEntityId);
	}

	/**
	 * Обновление экземпляра сущности "Пользователь"
	 * @param user Сущность "Пользователь"
	 * @returns Обновленная сущность
	 */
	public async update(user: User): Promise<User> {
		await this.knex
			.withSchema('usr')
			.table('user')
			.where({ id: user.id })
			.update(user);

		return await this.findOne(user.id);
	}

	/**
	 * Удаление списка сущностей "Пользователь"
	 * @param ids ID пользователей для удаления
	 */
	public async deleteByIds(ids: number[]): Promise<void> {
		await this.knex
			.withSchema('usr')
			.table('user')
			.delete()
			.whereIn('id', ids);
	}

	/**
	 * Получение сущности "Пользователь" по его email
	 * @param email Email
	 * @returns Сущность "Пользователь"
	 */
	public async findByEmail(email: string): Promise<User | undefined> {
		const entity = (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')
			.where('email', '=', email)) as User[];

		if (entity.length > 0) {
			return entity[0];
		}

		return undefined;
	}

	/**
	 * Получение сущности "Пользователь" по его ID
	 * @param id ID записи
	 * @returns Сущность "Пользователь"
	 */
	public async findOne(id: number): Promise<User> {
		const entity = (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')
			.where('id', '=', id)) as User[];

		return entity[0];
	}

	/**
	 * Получение сущности "Пользователь" по его ID
	 * или возврат ошибки 404 в случае, если сущность не найдена
	 * @param id ID записи
	 * @returns Сущность "Пользователь"
	 */
	public async findOneOr404(id: number): Promise<User> {
		const entity = (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')
			.where('id', '=', id)) as User[];

		if (entity.length === 0) {
			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_GENERATIVE,
					id
				)
			);
		}

		return entity[0];
	}
}
