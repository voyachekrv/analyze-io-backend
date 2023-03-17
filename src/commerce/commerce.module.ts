import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Shop } from './entities/shop.entity';
import { ShopController } from './webapi/shop.controller';
import { ShopRepository } from './repositories/shop.repository';
import { ShopService } from './services/shop.service';
import { ShopMapper } from './mappers/shop.mapper';
import { DataScientistModule } from '../data-scientist/data-scientist.module';
import { ShopStaffService } from './services/shop.staff.service';

/**
 * Модуль работы с коммерческими сущностями
 */
@Module({
	imports: [
		UserModule,
		DataScientistModule,
		TypeOrmModule.forFeature([Shop])
	],
	controllers: [ShopController],
	providers: [ShopRepository, ShopService, ShopMapper, ShopStaffService],
	exports: [ShopService, ShopStaffService]
})
export class CommerceModule {}
