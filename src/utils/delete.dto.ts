import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * DTO для операции удаления сущнностей
 */
export class DeleteDto {
	/**
	 * ID сущностей для их удаления
	 */
	@ApiProperty({
		description: 'ID сущностей для их удаления',
		example: [1, 2, 3],
		type: Number,
		isArray: true
	})
	@IsNumber({}, { each: true, message: 'Поле не явлется массивом числел' })
	ids: number[];
}
