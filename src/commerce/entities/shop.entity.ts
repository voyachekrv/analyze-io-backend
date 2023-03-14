import { PostgresSchemas } from '../../db/postgres.schemas';
import { User } from '../../user/entities/user.entity';
import {
	BeforeInsert,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { uuid } from 'uuidv4';

/**
 * Сущность - магазин
 */
@Entity('shop', { schema: PostgresSchemas.COMMERCE })
export class Shop {
	/**
	 * Сущность - магазин
	 * @param name Название
	 * @param user Владелец
	 * @param uuid UUID
	 */
	constructor(name: string, user?: User, uuid?: string) {
		this.name = name;

		if (user) {
			this.user = user;
		}

		if (uuid) {
			this.uuid = uuid;
		}
	}

	/**
	 * ID магазина
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Менеджер аналитики
	 */
	@ManyToOne(() => User, {
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'user_id' })
	user: User;

	/**
	 * Название
	 */
	@Column({ type: 'varchar', length: 512 })
	name: string;

	/**
	 * UUID
	 */
	@Column({ type: 'char', length: 36 })
	uuid: string;

	/**
	 * Генерация UUID перед вставкой сущности в БД
	 */
	@BeforeInsert()
	generateUUID(): void {
		if (!this.uuid) {
			this.uuid = uuid();
		}
	}
}
