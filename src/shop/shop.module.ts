import { ShopController } from './webapi/shop.controller';
import { ShopService } from './services/shop.service';
import { ShopMapper } from './mappers/shop.mapper';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma.service';
import { AvatarToolsModule } from '../avatar-tools/avatar-tools.module';
import { ShopAvatarService } from './services/shop-avatar.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerConfig } from '../multer-config';
import { ShopStaffService } from './services/shop-staff.service';

/**
 * Модуль для работы с магазинами
 */
@Module({
	imports: [
		ConfigModule,
		MulterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: multerConfig
		}),
		UserModule,
		AvatarToolsModule
	],
	controllers: [ShopController],
	providers: [
		ShopService,
		ShopMapper,
		PrismaService,
		ShopAvatarService,
		ShopStaffService
	],
	exports: [ShopService, ShopMapper]
})
export class ShopModule {}
