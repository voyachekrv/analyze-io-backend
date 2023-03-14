import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

/**
 * DTO смены менеджера подчиненным аналитикам
 */
export class SubordinatePatchDto {
	/**
	 * ID нового менеджера
	 */
	@ApiProperty({
		description: 'ID нового менеджера',
		example: 123
	})
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: 'Поле должно быть числом' }
	)
	@IsPositive({ message: 'Поле должно быть положительным числом' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
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
		{ each: true, message: 'Поле не явлется массивом числел' }
	)
	subordinates: number[];
}
