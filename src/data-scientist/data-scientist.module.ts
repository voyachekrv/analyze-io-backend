import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DataScientistService } from './services/data-scientist.service';
import { DataScientistController } from './webapi/data-scientist.controller';
import { DataScientistQueriesRepository } from './repositories/data-scientist-queries.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataScientistMapper } from './mappers/data-scientist.mapper';

/**
 * Модуль для работы с аналитиками
 */
@Module({
	imports: [UserModule, TypeOrmModule.forFeature([User])],
	providers: [
		DataScientistService,
		DataScientistQueriesRepository,
		DataScientistMapper
	],
	controllers: [DataScientistController],
	exports: [
		DataScientistService,
		DataScientistQueriesRepository,
		DataScientistMapper
	]
})
export class DataScientistModule {}
