import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ShopStrings } from '../shop.strings';

/**
 * DTO создания магазина
 */
export class ShopCreateDto {
	/**
	 * Название
	 */
	@ApiProperty({ description: 'Название', example: 'Aliexpress' })
	@IsString({ message: ShopStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: ShopStrings.SHOULD_BE_NOT_EMPTY })
	@MaxLength(512)
	name: string;
}
