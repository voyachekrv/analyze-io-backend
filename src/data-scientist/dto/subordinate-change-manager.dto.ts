import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
import { DataScientistStrings } from '../data-scientist.strings';

/**
 * DTO смены менеджера подчиненным аналитикам
 */
export class SubordinateChangeManagerDto {
	/**
	 * ID нового менеджера
	 */
	@ApiProperty({
		description: 'ID нового менеджера',
		example: 123
	})
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: DataScientistStrings.SHOULD_BE_NUMBER }
	)
	@IsPositive({ message: DataScientistStrings.SHOULD_BE_POSITIVE })
	@IsNotEmpty({ message: DataScientistStrings.SHOULD_NOT_BE_EMPTY })
	managerId: number;

	/**
	 * ID аналитиков для назначения их новому менеджеру
	 */
	@ApiProperty({
		description: 'ID аналитиков для назначения их новому менеджеру',
		example: [1, 2, 3],
		type: Number,
		isArray: true
	})
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ each: true, message: DataScientistStrings.SHOULD_BE_NUMS_ARRAY }
	)
	subordinates: number[];
}
