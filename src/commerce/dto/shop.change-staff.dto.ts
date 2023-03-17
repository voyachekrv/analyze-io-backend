import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * DTO для операции смены состава аналитиков магазина
 */
export class ShopChangeStaffDto {
	@ApiProperty({
		description: 'ID аналитиков для назначения их новому менеджеру',
		example: [1, 2, 3],
		type: Number,
		isArray: true
	})
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ each: true, message: 'Поле не явлется массивом числел' }
	)
	dataScientistIds: number[];
}
