import { ReportController } from './webapi/report.controller';
import { ReportService } from './services/report.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReportPayloadService } from './services/report-payload.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { ShopModule } from '../shop/shop.module';
import { ReportMapper } from './mappers/report.mapper';

@Module({
	imports: [ConfigModule, UserModule, ShopModule],
	controllers: [ReportController],
	providers: [
		PrismaService,
		ReportService,
		ReportPayloadService,
		ReportMapper
	]
})
export class ReportModule {}
