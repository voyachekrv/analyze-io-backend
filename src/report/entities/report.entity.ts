import { User } from '../../user/entities/user.entity';
import { PostgresSchemas } from '../../db/postgres.schemas';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { Shop } from '../../commerce/entities/shop.entity';

/**
 * Сущность - отчет
 */
@Entity('report', { schema: PostgresSchemas.COMMERCE })
export class Report {
	/**
	 * Сущность - отчет
	 * @param name Название
	 * @param file Файл
	 * @param comment Комментарий
	 * @param dataScientist Создатель
	 * @param shop Магазин
	 */
	constructor(
		name: string,
		file: string,
		comment: string,
		dataScientist: User,
		shop: Shop
	) {
		this.name = name;
		this.file = file;
		this.comment = comment;
		this.dataScientist = dataScientist;
		this.shop = shop;
	}

	/**
	 * ID
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Аналитик - создатель отчета
	 */
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		nullable: false
	})
	@JoinColumn({ name: 'data_scientist_id' })
	dataScientist: User;

	/**
	 * Магазин, в отношении которого делается отчет
	 */
	@ManyToOne(() => Shop, {
		onDelete: 'CASCADE',
		nullable: false
	})
	@JoinColumn({ name: 'shop_id' })
	shop: Shop;

	/**
	 * Дата создания отчета
	 */
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	/**
	 * Название отчета
	 */
	@Column({ type: 'varchar', length: 128 })
	name: string;

	/**
	 * Путь к файлу отчета
	 */
	@Column({ type: 'varchar', length: 256 })
	file: string;

	/**
	 * Комментарий к отчету
	 */
	@Column({ type: 'varchar', length: 1024 })
	comment: string;

	/**
	 * Просмотрен ли отчет менеджером
	 */
	@Column({ type: 'boolean', default: false })
	seenByManager: boolean;
}
