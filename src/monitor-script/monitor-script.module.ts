import { MonitorScriptController } from './monitor-script.controller';
import { ConfigModule } from '@nestjs/config';
import { MonitorScriptService } from './monitor-script.service';
import { Module } from '@nestjs/common';

/**
 * Модуль скрипта отслеживания
 */
@Module({
	imports: [ConfigModule],
	controllers: [MonitorScriptController],
	providers: [MonitorScriptService]
})
export class MonitorScriptModule {}
