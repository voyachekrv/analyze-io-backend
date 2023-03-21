import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO сущности отчет для помещения в списке
 */
export class ReportItemDto {
	/**
	 * DTO сущности отчет для помещения в списке
	 * @param id ID
	 * @param createdAt Дата создания
	 * @param name Название отчета
	 * @param seenByManager Был ли просмотрен отчет менеджером
	 */
	constructor(
		id: number,
		createdAt: Date,
		name: string,
		seenByManager: boolean
	) {
		this.id = id;
		this.createdAt = createdAt;
		this.name = name;
		this.seenByManager = seenByManager;
	}

	/**
	 * ID
	 */
	@ApiProperty({ description: 'ID', example: 123 })
	id: number;

	/**
	 * Дата создания
	 */
	@ApiProperty({
		description: 'Дата создания',
		example: new Date().toISOString()
	})
	createdAt: Date;

	/**
	 * Название отчета
	 */
	@ApiProperty({
		description: 'Название отчета',
		example: 'Отчет о посещении страницы за 2023 год'
	})
	name: string;

	/**
	 * Был ли просмотрен отчет менеджером
	 */
	@ApiProperty({
		description: 'Был ли просмотрен отчет менеджером',
		example: false
	})
	seenByManager: boolean;
}
