import { ApiProperty } from '@nestjs/swagger';
import { ReportPayload } from '../types/report-payload.type';

/**
 * DTO для обновление файла Отчета
 */
export class ReportFileUpdateDto {
	/**
	 * Данные для помещения их в файл отчета
	 */
	@ApiProperty({
		description: 'Данные для помещения их в файл отчета',
		example: {}
	})
	payload: ReportPayload;
}
