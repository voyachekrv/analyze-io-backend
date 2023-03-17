import { ApiProperty } from '@nestjs/swagger';
import { UserItemDto } from '../../user/dto/user.item.dto';
import { ShopItemDto } from './shop.item.dto';

/**
 * DTO результата смены персонала магазина
 */
export class ShopChangeStaffResultDto {
	/**
	 * DTO результата смены персонала магазина
	 * @param shop Магазин
	 * @param staff Аналитики на магазине
	 */
	constructor(shop: ShopItemDto, staff: UserItemDto[]) {
		this.shop = shop;
		this.staff = staff;
	}

	/**
	 * Магазин
	 */
	@ApiProperty({ description: 'Магазин', example: ShopItemDto })
	shop: ShopItemDto;

	/**
	 * Аналитики на магазине
	 */
	@ApiProperty({
		description: 'Аналитики на магазине',
		isArray: true,
		example: [UserItemDto]
	})
	staff: UserItemDto[];
}
