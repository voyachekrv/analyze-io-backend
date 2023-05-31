import { AvatarToolsService } from './avatar-tools.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * Модуль для инструментов работы с аватарами
 */
@Module({
	imports: [ConfigModule],
	controllers: [],
	providers: [AvatarToolsService],
	exports: [AvatarToolsService]
})
export class AvatarToolsModule {}
