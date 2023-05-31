import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportStrings } from '../report.strings';

/**
 * DTO для обновление сущности Отчет
 */
export class ReportUpdateDto {
	/**
	 * DTO для обновление сущности Отчет
	 * @param name Название отчета
	 * @param comment Комментарий к отчету
	 */
	constructor(name: string, comment: string) {
		this.name = name;
		this.comment = comment;
	}

	/**
	 * Название файла
	 */
	@ApiProperty({
		description: 'Название отчета',
		example: 'Отчет о посещении страницы за 2023 год'
	})
	@IsString({ message: ReportStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: ReportStrings.SHOULD_NOT_BE_EMPTY })
	@MaxLength(128)
	name: string;

	/**
	 * Комментарий к отчету
	 */
	@ApiProperty({
		description: 'Комментарий к отчету',
		example: 'Очень хорошее повышение просмотров за последний год'
	})
	@IsString({ message: ReportStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: ReportStrings.SHOULD_NOT_BE_EMPTY })
	@MaxLength(1024)
	comment: string;
}
