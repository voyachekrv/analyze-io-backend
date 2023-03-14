import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRoles } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Репозиторий для запросов, относящихся к аналитикам
 */
@Injectable()
export class DataScientistManagerQueriesRepository extends Repository<User> {
	/**
	 * Репозиторий для запросов, относящихся к аналитикам
	 * @param repository Стандартный репозиторий TypeORM
	 */
	constructor(
		@InjectRepository(User)
		repository: Repository<User>
	) {
		super(repository.target, repository.manager, repository.queryRunner);
	}

	/**
	 * Поиск всех аналитиков, подчиненных данному менеджеру
	 * @param managerId ID менеджера
	 * @returns Список сущностей
	 */
	public async findAll(managerId: number): Promise<User[]> {
		return await this.createQueryBuilder('user')
			.where('user.manager_id = :managerId', { managerId })
			.getMany();
	}

	/**
	 * Поиск аналитиков по их ID и ID их менеджера
	 * @param managerId ID менеджера
	 * @param ids Список ID аналитиков
	 * @returns Список сущностей
	 */
	public async findAllByIds(
		managerId: number,
		ids: number[]
	): Promise<User[]> {
		return await this.createQueryBuilder('user')
			.where('user.manager_id = :managerId', { managerId })
			.andWhereInIds(ids)
			.getMany();
	}

	/**
	 * Поиск менеджера или возврат 404 ошибки
	 * @param id ID менеджера
	 * @returns Менеджер
	 */
	public async findManagerOr404(id: number): Promise<User> {
		const entity = await this.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();

		if (!entity) {
			throw new NotFoundException(`Менеджер с id: ${id} не был найден`);
		}

		return entity;
	}

	/**
	 * Поиск аналитика по его ID и ID его менеджера
	 * @param managerId ID менеджера
	 * @param userId ID аналитика
	 * @returns Аналитик
	 */
	public async findOneOr404(
		managerId: number,
		userId: number
	): Promise<User> {
		const entity = await this.createQueryBuilder('user')
			.leftJoinAndSelect('user.manager', 'manager')
			.where('user.manager_id = :managerId', { managerId })
			.andWhere('user.id = :id', { id: userId })
			.getOne();

		if (!entity) {
			throw new NotFoundException(
				`Аналитик с id: ${userId} не был найден`
			);
		}

		return entity;
	}

	/**
	 * Проверка на то, является ли пользователь менеджером
	 * @param id ID пользователя
	 * @returns Является ли пользователь менеджером
	 */
	public async isManager(id: number): Promise<boolean> {
		try {
			const entity = await this.findManagerOr404(id);
			if (entity.role === UserRoles.DATA_SCIENCE_MANAGER) {
				return true;
			}

			return false;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Удаление аналитиков
	 * @param managerId ID менеджера
	 * @param ids ID сущностей для удаления
	 */
	public async deleteByIds(managerId: number, ids: number[]): Promise<void> {
		await this.createQueryBuilder('user')
			.delete()
			.from(User)
			.where('manager_id = :managerId', { managerId })
			.andWhereInIds(ids)
			.execute();
	}
}
