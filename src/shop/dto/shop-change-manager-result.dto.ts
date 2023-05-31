import { ApiProperty } from '@nestjs/swagger';
import { UserItemDto } from '../../user/dto/user/user.item.dto';
import { ShopItemDto } from './shop.item.dto';

/**
 * DTO результата смены владельца магазина
 */
export class ShopChangeManagerResultDto {
	/**
	 * DTO результата смены владельца магазина
	 * @param shop Магазин
	 * @param newOwner Новый владелец
	 */
	constructor(shop: ShopItemDto, newOwner: UserItemDto) {
		this.shop = shop;
		this.newOwner = newOwner;
	}

	/**
	 * Магазин
	 */
	@ApiProperty({
		description: 'Магазин',
		example: ShopItemDto
	})
	shop: ShopItemDto;

	/**
	 * Новый владелец
	 */
	@ApiProperty({
		description: 'Новый владелец магазина',
		example: UserItemDto
	})
	newOwner: UserItemDto;
}
