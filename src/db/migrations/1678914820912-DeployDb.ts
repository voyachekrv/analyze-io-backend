import { MigrationInterface, QueryRunner } from 'typeorm';
import { config } from 'dotenv';
import * as CryptoJS from 'crypto-js';

config();

export class DeployDb1678914820912 implements MigrationInterface {
	name = 'DeployDb1678914820912';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE SCHEMA usr;');

		await queryRunner.query('CREATE SCHEMA commerce;');

		await queryRunner.query(`CREATE TABLE "usr"."user" (
			"id" SERIAL NOT NULL, "email" character varying(200) NOT NULL, "password" character varying(200) NOT NULL, 
			"role" character varying(32) NOT NULL, "name" character varying(300) NOT NULL, "manager_id" integer, 
			CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
		)`);
		await queryRunner.query(`CREATE TABLE "commerce"."shop" (
			"id" SERIAL NOT NULL, "name" character varying(512) NOT NULL, "uuid" character(36) NOT NULL, 
			"user_id" integer, CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id")
		)`);
		await queryRunner.query(`CREATE TABLE "usr"."user_shops_shop" (
			"userId" integer NOT NULL, "shopId" integer NOT NULL, CONSTRAINT "PK_1608f9e08ddc57a7bd1d63ffa4b" 
			PRIMARY KEY ("userId", "shopId")
		)`);
		await queryRunner.query(
			'CREATE INDEX "IDX_f0a70bdfa77eab06eaa824b2a5" ON "usr"."user_shops_shop" ("userId") '
		);
		await queryRunner.query(
			'CREATE INDEX "IDX_b83248581d72cf5e9fbc9b006f" ON "usr"."user_shops_shop" ("shopId") '
		);
		await queryRunner.query(`CREATE TABLE "commerce"."shop_analytics_user" (
			"shopId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_e255b66cd89d3ab50a246ffeabf"
			 PRIMARY KEY ("shopId", "userId")
		)`);
		await queryRunner.query(
			'CREATE INDEX "IDX_e79607aeb8308f4f9c710d6176" ON "commerce"."shop_analytics_user" ("shopId") '
		);
		await queryRunner.query(
			'CREATE INDEX "IDX_9897547de677a8e5b198c3faeb" ON "commerce"."shop_analytics_user" ("userId") '
		);
		await queryRunner.query(
			`ALTER TABLE "usr"."user" ADD CONSTRAINT "FK_b925754780ce53c20179d7204f9" 
			FOREIGN KEY ("manager_id") REFERENCES "usr"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "commerce"."shop" ADD CONSTRAINT "FK_801741ae213da67afe2f556d207" 
			FOREIGN KEY ("user_id") REFERENCES "usr"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "usr"."user_shops_shop" ADD CONSTRAINT "FK_f0a70bdfa77eab06eaa824b2a59" 
			FOREIGN KEY ("userId") REFERENCES "usr"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "usr"."user_shops_shop" ADD CONSTRAINT "FK_b83248581d72cf5e9fbc9b006fe" 
			FOREIGN KEY ("shopId") REFERENCES "commerce"."shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "commerce"."shop_analytics_user" ADD CONSTRAINT "FK_e79607aeb8308f4f9c710d6176c" 
			FOREIGN KEY ("shopId") REFERENCES "commerce"."shop"("id") ON DELETE CASCADE ON UPDATE CASCADE`
		);
		await queryRunner.query(
			`ALTER TABLE "commerce"."shop_analytics_user" ADD CONSTRAINT "FK_9897547de677a8e5b198c3faeb6" 
			FOREIGN KEY ("userId") REFERENCES "usr"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('root@root.com', '${CryptoJS.AES.encrypt(
				'toor',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'ROOT', 'Root1', NULL)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser1@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENCE_MANAGER', 'Петров Пётр Петрович', NULL)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser2@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENCE_MANAGER', 'John Smith', NULL)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser3@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENCE_MANAGER', 'Horthy Miklós', NULL)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser4@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Васильева Васисиса Михайловна', 2)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser5@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Иванов Иван Иванович', 2)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser6@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Кузнецова Роза Степановна', 3)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser7@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Усаги Цукино', 2)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser8@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Ами Мицуно', 2)`
		);

		await queryRunner.query(
			`INSERT INTO usr."user" (email, "password", "role", "name", "manager_id") VALUES('testuser9@gmail.com', '${CryptoJS.AES.encrypt(
				'test1',
				process.env.AIO_PRIVATE_KEY
			).toString()}', 'DATA_SCIENTIST', 'Рэй Хино', 2)`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			'ALTER TABLE "commerce"."shop_analytics_user" DROP CONSTRAINT "FK_9897547de677a8e5b198c3faeb6"'
		);
		await queryRunner.query(
			'ALTER TABLE "commerce"."shop_analytics_user" DROP CONSTRAINT "FK_e79607aeb8308f4f9c710d6176c"'
		);
		await queryRunner.query(
			'ALTER TABLE "usr"."user_shops_shop" DROP CONSTRAINT "FK_b83248581d72cf5e9fbc9b006fe"'
		);
		await queryRunner.query(
			'ALTER TABLE "usr"."user_shops_shop" DROP CONSTRAINT "FK_f0a70bdfa77eab06eaa824b2a59"'
		);
		await queryRunner.query(
			'ALTER TABLE "commerce"."shop" DROP CONSTRAINT "FK_801741ae213da67afe2f556d207"'
		);
		await queryRunner.query(
			'ALTER TABLE "usr"."user" DROP CONSTRAINT "FK_b925754780ce53c20179d7204f9"'
		);
		await queryRunner.query(
			'DROP INDEX "commerce"."IDX_9897547de677a8e5b198c3faeb"'
		);
		await queryRunner.query(
			'DROP INDEX "commerce"."IDX_e79607aeb8308f4f9c710d6176"'
		);
		await queryRunner.query('DROP TABLE "commerce"."shop_analytics_user"');
		await queryRunner.query(
			'DROP INDEX "usr"."IDX_b83248581d72cf5e9fbc9b006f"'
		);
		await queryRunner.query(
			'DROP INDEX "usr"."IDX_f0a70bdfa77eab06eaa824b2a5"'
		);
		await queryRunner.query('DROP TABLE "usr"."user_shops_shop"');
		await queryRunner.query('DROP TABLE "commerce"."shop"');
		await queryRunner.query('DROP TABLE "usr"."user"');
		await queryRunner.query('DROP SCHEMA commerce;');
		await queryRunner.query('DROP SCHEMA usr;');
	}
}
