import { ShopItemDto } from '../../commerce/dto/shop.item.dto';
import { UserItemDto } from '../../user/dto/user.item.dto';

/**
 * Именованные параметры конструктора класса ReportCardDto
 */
export type ReportCardDtoConstructorParams = {
	/**
	 * ID
	 */
	id: number;

	/**
	 * Дата создания
	 */
	createdAt: Date;

	/**
	 * Название отчета
	 */
	name: string;

	/**
	 * Название файла
	 */
	file: string;

	/**
	 * Комментарий к отчету
	 */
	comment: string;

	/**
	 * Был ли просмотрен отчет менеджером
	 */
	seenByManager: boolean;

	/**
	 * Создатель отчета
	 */
	dataScientist: UserItemDto;

	/**
	 * Магазин, на основе которого строится отчет
	 */
	shop: ShopItemDto;
};
