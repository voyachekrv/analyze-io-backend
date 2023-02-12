import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CommerceModule } from './commerce/commerce.module';
import { ResourceModule } from './resource/resource.module';
import { dataSourceFactory } from './db/data-source-factory';

/**
 * Основной модуль приложения
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env'
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: dataSourceFactory
		}),
		UserModule,
		CommerceModule,
		ResourceModule
	]
})
export class AppModule {}
