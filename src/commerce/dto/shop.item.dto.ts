import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO отображения магазина в списке
 */
export class ShopItemDto {
	/**
	 * DTO отображения магазина в списке
	 * @param id ID
	 * @param name Название
	 */
	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}

	/**
	 * ID
	 */
	@ApiProperty({ description: 'ID', example: 1 })
	id: number;

	/**
	 * Название
	 */
	@ApiProperty({ description: 'Название', example: 'Aliexpress' })
	name: string;
}
