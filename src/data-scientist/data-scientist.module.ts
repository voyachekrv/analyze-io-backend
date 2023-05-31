import { DataScientistController } from './webapi/data-scientist.controller';
import { DataScientistService } from './services/data-scientist.service';
import { Module } from '@nestjs/common';
import { DataScientistMapper } from './mappers/data-scientist.mapper';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';

/**
 * Модуль для работы с аналитиками
 */
@Module({
	imports: [UserModule],
	controllers: [DataScientistController],
	providers: [DataScientistService, DataScientistMapper, PrismaService],
	exports: [DataScientistMapper, DataScientistService]
})
export class DataScientistModule {}
