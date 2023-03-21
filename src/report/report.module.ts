import { Module } from '@nestjs/common';
import { CommerceModule } from '../commerce/commerce.module';
import { DataScientistModule } from '../data-scientist/data-scientist.module';
import { ReportController } from './webapi/report.controller';
import { ReportMapper } from './mappers/report.mapper';
import { ReportRepository } from './repositories/report.repository';
import { ReportPayloadService } from './services/report.payload.service';
import { ReportService } from './services/report.service';
import { UserModule } from '../user/user.module';
import { Report } from './entities/report.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Shop } from '../commerce/entities/shop.entity';
import { User } from '../user/entities/user.entity';

/**
 * Модуль для работы с отчетами
 */
@Module({
	imports: [
		DataScientistModule,
		CommerceModule,
		UserModule,
		ConfigModule,
		TypeOrmModule.forFeature([Report, Shop, User])
	],
	controllers: [ReportController],
	providers: [
		ReportService,
		ReportPayloadService,
		ReportRepository,
		ReportMapper
	]
})
export class ReportModule {}
