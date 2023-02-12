import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { AuthController } from './webapi/auth.controller';
import { UserController } from './webapi/user.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserMapper } from './mappers/user.mapper';
import { PasswordService } from './services/password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * Конфигурация JWT-модуля
 * @param configService Сервис конфигурации
 * @returns Опции JWT-модуля
 */
const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
	return {
		secret: configService.get<string>('PRIVATE_KEY') || 'SECRET',
		signOptions: {
			expiresIn: '48h'
		}
	};
};

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
		TypeOrmModule.forFeature([User])
	],
	controllers: [AuthController, UserController],
	providers: [
		AuthService,
		UserService,
		UserMapper,
		UserRepository,
		PasswordService
	],
	exports: [JwtModule, UserRepository]
})
export class UserModule {}
