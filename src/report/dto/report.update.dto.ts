import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
	@IsString({ message: 'Поле должно быть строкой' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
	@MaxLength(128)
	name: string;

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
}
