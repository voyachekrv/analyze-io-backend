import { CommerceModule } from '../commerce/commerce.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResourceService } from './services/resource.service';
import { ResourceController } from './webapi/resource.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [ResourceController],
	providers: [ResourceService],
	imports: [CommerceModule, ConfigModule, UserModule, JwtModule]
})
export class ResourceModule {}
