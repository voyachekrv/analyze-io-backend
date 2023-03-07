import { CommerceModule } from '../commerce/commerce.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResourceService } from './services/resource.service';
import { ResourceController } from './webapi/resource.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../multer-config';

/**
 * Модуль работы со скачиваемыми ресурсами
 */
@Module({
	controllers: [ResourceController],
	providers: [ResourceService],
	imports: [
		CommerceModule,
		ConfigModule,
		UserModule,
		JwtModule,
		MulterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: multerConfig
		})
	]
})
export class ResourceModule {}
