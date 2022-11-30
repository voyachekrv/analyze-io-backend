/* eslint-disable newline-per-chained-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'util';
import { InjectKnex, Knex } from 'nestjs-knex';
import { User } from '../entities/user.entity';
import { UserStrings } from '../user.strings';

@Injectable()
export class UserRepository {
	constructor(@InjectKnex() private readonly knex: Knex) {}

	public async find(): Promise<User[]> {
		return (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')) as User[];
	}

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

	public async findOne(id: number): Promise<User> {
		const entity = (await this.knex
			.withSchema('usr')
			.select('*')
			.from('user')
			.where('id', '=', id)) as User[];

		return entity[0];
	}

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
