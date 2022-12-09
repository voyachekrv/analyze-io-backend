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
				"role" character varying(32) NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
			)
			`
		);
		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role") VALUES('root@root.com', '${CryptoJS.AES.encrypt(
				'toor',
				process.env.PRIVATE_KEY
			).toString()}', 'ROOT')`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DELETE FROM "usr"."user" WHERE id = 1');
		await queryRunner.query('DROP TABLE "usr"."user"');
		await queryRunner.query('drop schema usr;');
	}
}
