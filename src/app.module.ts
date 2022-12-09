import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { config } from 'dotenv';
import { dataSourceOptions } from './db/data-source';

config();

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env'
		}),
		TypeOrmModule.forRoot(dataSourceOptions),
		UserModule
	]
})
export class AppModule {}
