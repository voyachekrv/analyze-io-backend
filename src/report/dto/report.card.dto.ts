import { ApiProperty } from '@nestjs/swagger';
import { ShopItemDto } from '../../commerce/dto/shop.item.dto';
import { UserItemDto } from '../../user/dto/user.item.dto';
import { ReportCardDtoConstructorParams } from '../types/report-card-dto-constructor-params.type';

/**
 * DTO сущности отчет для помещения в карточке
 */
export class ReportCardDto {
	/**
	 * DTO сущности отчет для помещения в карточке
	 * @param param0 Параметры конструктора
	 */
	constructor({
		id,
		createdAt,
		name,
		file,
		comment,
		seenByManager,
		dataScientist,
		shop
	}: ReportCardDtoConstructorParams) {
		this.id = id;
		this.createdAt = createdAt;
		this.name = name;
		this.file = file;
		this.comment = comment;
		this.seenByManager = seenByManager;
		this.dataScientist = dataScientist;
		this.shop = shop;
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
	 * Название файла
	 */
	@ApiProperty({
		description: 'Название файла',
		example: '2023-03-20_Report1.csv'
	})
	file: string;

	/**
	 * Комментарий к отчету
	 */
	@ApiProperty({
		description: 'Комментарий к отчету',
		example: 'Очень хорошее повышение просмотров за последний год'
	})
	comment: string;

	/**
	 * Был ли просмотрен отчет менеджером
	 */
	@ApiProperty({
		description: 'Был ли просмотрен отчет менеджером',
		example: false
	})
	seenByManager: boolean;

	/**
	 * Создатель отчета
	 */
	@ApiProperty({
		description: 'Создатель отчета',
		example: UserItemDto
	})
	dataScientist: UserItemDto;

	/**
	 * Магазин, на основе которого строится отчет
	 */
	@ApiProperty({
		description: 'Магазин, на основе которого строится отчет',
		example: ShopItemDto
	})
	shop: ShopItemDto;
}
