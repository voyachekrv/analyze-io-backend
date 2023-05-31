import { Module } from '@nestjs/common';
import { UserController } from './webapi/user.controller';
import { UserService } from './services/user.service';
import { UserMapper } from './mappers/user.mapper';
import { PasswordService } from './services/password.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { AuthController } from './webapi/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { jwtConfig } from '../jwt-config';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../multer-config';
import { UserAvatarService } from './services/user-avatar.service';
import { AvatarToolsModule } from '../avatar-tools/avatar-tools.module';

/**
 * Модуль работы с пользователями
 */
@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: jwtConfig
		}),
		MulterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: multerConfig
		}),
		AvatarToolsModule
	],
	controllers: [UserController, AuthController],
	providers: [
		UserService,
		UserMapper,
		PasswordService,
		PrismaService,
		AuthService,
		UserAvatarService
	],
	exports: [JwtModule, UserService, UserMapper]
})
export class UserModule {}
