import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DataScientistManagerService } from './services/data-scientist-manager.service';
import { DataScientistManagerController } from './webapi/data-scientist-manager.controller';
import { DataScientistManagerQueriesRepository } from './repositories/data-scientist-manager-queries.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

/**
 * Модуль для работы с аналитиками
 */
@Module({
	imports: [UserModule, TypeOrmModule.forFeature([User])],
	providers: [
		DataScientistManagerService,
		DataScientistManagerQueriesRepository
	],
	controllers: [DataScientistManagerController]
})
export class DataScientistManagerModule {}
