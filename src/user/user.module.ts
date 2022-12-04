import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { AuthController } from './webapi/auth.controller';
import { UserController } from './webapi/user.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserMapper } from './mappers/user.mapper';
import { UserVerifyService } from './services/user-verify.service';
import { PasswordService } from './services/password.service';

const jwtConfig = (configService: ConfigService): JwtModuleOptions => {
	return {
		secret: configService.get<string>('PRIVATE_KEY') || 'SECRET',
		signOptions: {
			expiresIn: '48h'
		}
	};
};

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: jwtConfig
		})
	],
	controllers: [AuthController, UserController],
	providers: [
		AuthService,
		UserService,
		UserMapper,
		UserVerifyService,
		UserRepository,
		PasswordService
	],
	exports: [UserVerifyService]
})
export class UserModule {}
