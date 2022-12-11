import { PostgresSchemas } from '../../db/postgres.schemas';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Роли пользователя
 */
export enum UserRoles {
	/**
	 * Пользователь без привилегий суперпользователя
	 */
	USER = 'USER',
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
		role?: UserRoles
	) {
		this.email = email;
		this.password = password;
		this.name = name;

		if (role) {
			this.role = role;
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
}
