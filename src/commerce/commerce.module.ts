import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Shop } from './entities/shop.entity';
import { ShopController } from './webapi/shop.controller';
import { ShopRepository } from './repositories/shop.repository';
import { ShopService } from './services/shop.service';
import { ShopMapper } from './mappers/shop.mapper';

@Module({
	imports: [UserModule, TypeOrmModule.forFeature([Shop])],
	controllers: [ShopController],
	providers: [ShopRepository, ShopService, ShopMapper],
	exports: [ShopService]
})
export class CommerceModule {}
