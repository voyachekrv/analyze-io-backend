import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from '../../utils/page';
import { Repository } from 'typeorm';
import { format } from 'util';
import { User } from '../entities/user.entity';
import { UserStrings } from '../user.strings';
import {
	UserPaginator,
	UserSearchConditions
} from '../paginators/user.paginator';

/**
 * Репозиторий для сущности "Пользователь"
 */
@Injectable()
export class UserRepository extends Repository<User> {
	constructor(
		@InjectRepository(User)
		repository: Repository<User>
	) {
		super(repository.target, repository.manager, repository.queryRunner);
	}

	/**
	 * Получение всех экземпляров сущности "Пользователь"
	 * @returns Список пользователей
	 */
	public async findAll(page: number): Promise<Page<User>> {
		return new Page(
			await new UserPaginator<User, UserSearchConditions>().paginateQuery(
				this.createQueryBuilder('user'),
				{
					page,
					orderBy: {
						field: 'id',
						direction: 'ASC'
					}
				}
			)
		);
	}

	/**
	 * Удаление списка сущностей "Пользователь"
	 * @param ids ID пользователей для удаления
	 */
	public async deleteByIds(ids: number[]): Promise<void> {
		await this.createQueryBuilder('user')
			.delete()
			.from(User)
			.whereInIds(ids)
			.execute();
	}

	/**
	 * Получение сущности "Пользователь" по его email
	 * @param email Email
	 * @returns Сущность "Пользователь"
	 */
	public async findByEmail(email: string): Promise<User | undefined> {
		const entity = await this.createQueryBuilder('user')
			.where({ email })
			.getOne();

		if (entity) {
			return entity;
		}

		return undefined;
	}

	/**
	 * Получение сущности "Пользователь" по его ID
	 * @param id ID записи
	 * @returns Сущность "Пользователь"
	 */
	public async findById(id: number): Promise<User> {
		const entity = await this.createQueryBuilder('user')
			.where({ id })
			.getOne();

		return entity;
	}

	/**
	 * Получение сущности "Пользователь" по его ID
	 * или возврат ошибки 404 в случае, если сущность не найдена
	 * @param id ID записи
	 * @returns Сущность "Пользователь"
	 */
	public async findOneOr404(id: number): Promise<User> {
		const entity = await this.createQueryBuilder('user')
			.leftJoinAndSelect('user.manager', 'manager')
			.where({ id })
			.getOne();

		if (!entity) {
			throw new NotFoundException(
				format(
					UserStrings.NOT_FOUND_SMTH,
					UserStrings.USER_GENERATIVE,
					id
				)
			);
		}

		return entity;
	}
}
