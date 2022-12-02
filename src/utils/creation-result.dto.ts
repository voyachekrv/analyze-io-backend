import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO результата создания сущности
 */
export class CreationResultDto {
	/**
	 * DTO результата создания сущности
	 * @param id ID сущности
	 */
	constructor(id: number) {
		this.id = id;
	}

	/**
	 * ID сущности
	 */
	@ApiProperty({ description: 'ID сущности', example: 123 })
	id: number;
}
