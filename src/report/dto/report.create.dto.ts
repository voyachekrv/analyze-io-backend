import { ApiProperty } from '@nestjs/swagger';
import { ReportPayload } from '../types/report-payload.type';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO для создания сущности Отчет
 */
export class ReportCreateDto {
	/**
	 * Название отчета
	 */
	@ApiProperty({
		description: 'Название отчета',
		example: 'Отчет о посещении страницы за 2023 год'
	})
	@IsString({ message: 'Поле должно быть строкой' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
	@MaxLength(128)
	name: string;

	/**
	 * Название файла
	 */
	@ApiProperty({
		description: 'Название файла',
		example: '2023-03-20_Report1.csv'
	})
	@IsString({ message: 'Поле должно быть строкой' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
	@MaxLength(256)
	file: string;

	/**
	 * Комментарий к отчету
	 */
	@ApiProperty({
		description: 'Комментарий к отчету',
		example: 'Очень хорошее повышение просмотров за последний год'
	})
	@IsString({ message: 'Поле должно быть строкой' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
	@MaxLength(1024)
	comment: string;

	/**
	 * Данные для помещения их в файл отчета
	 */
	@ApiProperty({
		description: 'Данные для помещения их в файл отчета',
		example: {}
	})
	payload: ReportPayload;
}
