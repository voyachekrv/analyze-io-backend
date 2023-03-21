/* eslint-disable no-use-before-define */
import { Shop } from '../../commerce/entities/shop.entity';
import { PostgresSchemas } from '../../db/postgres.schemas';
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	ManyToMany,
	JoinTable
} from 'typeorm';

/**
 * Роли пользователя
 */
export enum UserRoles {
	/**
	 * Аналитик
	 */
	DATA_SCIENTIST = 'DATA_SCIENTIST',

	/**
	 * Менеджер по анализу данных
	 */
	DATA_SCIENCE_MANAGER = 'DATA_SCIENCE_MANAGER',

	/**
	 * Суперпользователь
	 */
	ROOT = 'ROOT'
}

/**
 * Сущность - пользователь
 */
@Entity('user', { schema: PostgresSchemas.USR })
export class User {
	/**
	 * Сущность - пользователь
	 * @param email Email
	 * @param password Пароль
	 * @param name Имя пользователя
	 * @param role Роль
	 */
	constructor(
		email: string,
		password: string,
		name: string,
		manager?: User,
		role?: UserRoles,
		shops?: Shop[]
	) {
		this.email = email;
		this.password = password;
		this.name = name;

		if (manager) {
			this.manager = manager;
		}

		if (role) {
			this.role = role;
		}

		if (shops) {
			this.shops = shops;
		}
	}

	/**
	 * ID пользователя
	 */
	@PrimaryGeneratedColumn()
	id: number;

	/**
	 * Email
	 */
	@Column({ type: 'varchar', length: 200 })
	email: string;

	/**
	 * Пароль
	 */
	@Column({ type: 'varchar', length: 200 })
	password: string;

	/**
	 * Роль
	 */
	@Column({ type: 'varchar', length: 32 })
	role: UserRoles;

	/**
	 * Имя пользователя
	 */
	@Column({ type: 'varchar', length: 300 })
	name: string;

	/**
	 * Менеджер (для аналитика)
	 */
	@ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'CASCADE' })
	@JoinColumn({
		name: 'manager_id',
		referencedColumnName: 'id'
	})
	manager: User;

	/**
	 * Магазины, на которых работает аналитик
	 */
	@ManyToMany(() => Shop, shop => shop.analytics, {
		nullable: true
	})
	@JoinTable({
		schema: 'commerce',
		name: 'shop_analytics_user'
	})
	shops: Shop[];
}
