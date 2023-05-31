import { ApiProperty } from '@nestjs/swagger';
import { UserItemDto } from '../../user/dto/user/user.item.dto';

/**
 * DTO отображения магазина в карточке
 */
export class ShopCardDto {
	/**
	 * DTO отображения магазина в карточке
	 * @param id ID
	 * @param name Название
	 * @param uuid UUID
	 * @param owner Менеджер аналитики
	 * @param avatar Аватар
	 * @param dataScientists Аналитики
	 */
	constructor(
		id: number,
		name: string,
		uuid: string,
		owner: UserItemDto,
		avatar?: string,
		dataScientists?: UserItemDto[]
	) {
		this.id = id;
		this.name = name;
		this.uuid = uuid;
		this.owner = owner;

		if (avatar) {
			this.avatar = avatar;
		}

		if (dataScientists) {
			this.dataScientists = dataScientists;
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
	 * UUID
	 */
	@ApiProperty({
		description: 'UUID',
		example: 'bce015d8-ff71-4caa-854f-e51f85bd65d2 '
	})
	uuid: string;

	/**
	 * Менеджер аналитики
	 */
	@ApiProperty({ description: 'Менеджер аналитики', example: UserItemDto })
	owner: UserItemDto;

	/**
	 * Путь к аватару
	 */
	@ApiProperty({
		description: 'Путь к аватару',
		example: '/shop-avatars/avatar.png',
		required: false
	})
	avatar?: string;

	/**
	 * Аналитики на магазине
	 */
	@ApiProperty({
		description: 'Аналитики на магазине',
		example: [UserItemDto]
	})
	dataScientists?: UserItemDto[];
}
