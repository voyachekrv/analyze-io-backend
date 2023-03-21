import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

/**
 * Репозиторий для сущности "Отчет"
 */
@Injectable()
export class ReportRepository extends Repository<Report> {
	constructor(
		@InjectRepository(Report)
		repository: Repository<Report>
	) {
		super(repository.target, repository.manager, repository.queryRunner);
	}

	/**
	 * Поиск всех отчетов в магазине
	 * @param shopId ID магазина
	 * @returns Список отчетов
	 */
	public async findAll(shopId: number): Promise<Report[]> {
		return await this.createQueryBuilder('report')
			.leftJoinAndSelect('report.shop', 'shop')
			.leftJoinAndSelect('report.dataScientist', 'user')
			.where('report.shop_id = :shopId', { shopId })
			.getMany();
	}

	/**
	 * Удаление отчетов по ID
	 * @param shopId ID магазина
	 * @param ids ID отчетов для удаления
	 */
	public async deleteByIds(shopId: number, ids: number[]): Promise<void> {
		await this.createQueryBuilder('report')
			.delete()
			.from(Report)
			.whereInIds(ids)
			.andWhere('report.shop_id = :shopId', { shopId })
			.execute();
	}

	/**
	 * Получение множества отчетов по их ID
	 * @param shopId ID магазина
	 * @param ids ID отчетов для поиска
	 * @returns Список отчетов
	 */
	public async findAllByIds(
		shopId: number,
		ids: number[]
	): Promise<Report[]> {
		return await this.createQueryBuilder('report')
			.whereInIds(ids)
			.andWhere('report.shop_id = :shopId', { shopId })
			.getMany();
	}

	/**
	 * Поиск отчета по его ID
	 * @param shopId ID магазина
	 * @param id ID Отчета
	 * @returns Отчет
	 */
	public async findById(shopId: number, id: number): Promise<Report> {
		return await this.createQueryBuilder('report')
			.leftJoinAndSelect('report.shop', 'shop')
			.leftJoinAndSelect('report.dataScientist', 'user')
			.where({ id })
			.andWhere('report.shop_id = :shopId', { shopId })
			.getOne();
	}
}
