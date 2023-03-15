import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

/**
 * Данные для смены владельца магазина
 */
export class ShopPatchInputDto {
	/**
	 * ID нового владельца магазина
	 */
	@ApiProperty({ description: 'ID нового владельца магазина', example: 123 })
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: 'Поле должно быть числом' }
	)
	@IsPositive({ message: 'Поле должно быть положительным числом' })
	@IsNotEmpty({ message: 'Поле не должно быть пустым' })
	managerId: number;
}
