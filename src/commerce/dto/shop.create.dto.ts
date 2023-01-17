import { CommerceStrings } from '../commerce.strings';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO создания магазина
 */
export class ShopCreateDto {
	/**
	 * Название
	 */
	@ApiProperty({ description: 'Название', example: 'Aliexpress' })
	@IsString({ message: CommerceStrings.SHOULD_BE_STRING })
	@IsNotEmpty({ message: CommerceStrings.SHOULD_BE_NOT_EMPTY })
	@MaxLength(512)
	name: string;
}
