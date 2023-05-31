import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO отображения магазина в списке
 */
export class ShopItemDto {
	/**
	 * DTO отображения магазина в списке
	 * @param id ID
	 * @param name Название
	 * @param avatar Аватар
	 */
	constructor(id: number, name: string, avatar?: string) {
		this.id = id;
		this.name = name;

		if (avatar) {
			this.avatar = avatar;
		}
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
	 * Путь к аватару
	 */
	@ApiProperty({
		description: 'Путь к аватару',
		example: '/shop-avatars/avatar.png',
		required: false
	})
	avatar?: string;
}
