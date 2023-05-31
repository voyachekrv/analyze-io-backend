import { ApiProperty } from '@nestjs/swagger';
import { UserItemDto } from '../../user/dto/user/user.item.dto';

/**
 * Результат изменения менеджера аналитика
 */
export class SubordinateChangeManagerResultDto {
	/**
	 * Результат изменения менеджера аналитика
	 * @param subordinate Аналитик в подчинении
	 * @param newManager Новый менеджер
	 */
	constructor(subordinate: UserItemDto, newManager: UserItemDto) {
		this.subordinate = subordinate;
		this.newManager = newManager;
	}

	/**
	 * Аналитик в подчинении
	 */
	@ApiProperty({ description: 'Аналитик в подчинении', example: UserItemDto })
	subordinate: UserItemDto;

	/**
	 * Новый менеджер
	 */
	@ApiProperty({ description: 'Новый менеджер', example: UserItemDto })
	newManager: UserItemDto;
}
