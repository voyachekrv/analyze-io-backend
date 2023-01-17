import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO отображения магазина в карточке
 */
export class ShopCardDto {
	/**
	 * DTO отображения магазина в карточке
	 * @param id ID
	 * @param name Название
	 * @param uuid UUID
	 */
	constructor(id: number, name: string, uuid: string) {
		this.id = id;
		this.name = name;
		this.uuid = uuid;
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

	/**
	 * UUID
	 */
	@ApiProperty({
		description: 'UUID',
		example: 'bce015d8-ff71-4caa-854f-e51f85bd65d2 '
	})
	uuid: string;
}
