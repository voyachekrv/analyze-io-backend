import { MigrationInterface, QueryRunner } from 'typeorm';
import { config } from 'dotenv';
import * as CryptoJS from 'crypto-js';

config();

export class DeployDb1670577754860 implements MigrationInterface {
	name = 'DeployDb1670577754860';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('create schema usr;');
		await queryRunner.query(
			`
			CREATE TABLE "usr"."user" (
				"id" SERIAL NOT NULL, 
				"email" character varying(200) NOT NULL, 
				"password" character varying(200) NOT NULL, 
				"role" character varying(32) NOT NULL,
				"name" character varying(300) NOT NULL, 
				CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
			)
			`
		);
		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('root@root.com', '${CryptoJS.AES.encrypt(
				'toor',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'ROOT', 'Root1')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser1@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'Петров Пётр Петрович')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser2@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'John Smith')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser3@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'Horthy Miklós')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser4@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'Васильева Васисиса Михайловна')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser5@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'Иванов Иван Иванович')`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name") VALUES('testuser6@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'USER', 'Кузнецова Роза Степановна')`
		);

		await queryRunner.query('create schema commerce');

		await queryRunner.query(
			`CREATE TABLE commerce.shop (
				id serial4 NOT NULL,
				name varchar(512) NOT NULL,
				uuid bpchar(36) NOT NULL,
				user_id int4 NULL,
				CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY (id)
			)`
		);

		await queryRunner.query(
			`ALTER TABLE commerce.shop ADD CONSTRAINT "FK_801741ae213da67afe2f556d207" 
			FOREIGN KEY (user_id) REFERENCES usr."user"(id) ON DELETE CASCADE;`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP TABLE "commerce"."shop";');
		await queryRunner.query('drop schema commerce;');
		await queryRunner.query('DROP TABLE "usr"."user";');
		await queryRunner.query('drop schema usr;');
	}
}
