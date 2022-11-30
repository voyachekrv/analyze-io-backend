import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nestjs-knex';
import { postgressConnection } from './db/postgres.connection';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env'
		}),
		KnexModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: postgressConnection
		}),
		UserModule
	]
})
export class AppModule {}
