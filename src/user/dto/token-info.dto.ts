import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../entities/user.entity';

/**
 * Данные, извлекаемые из токена авторизации
 */
export class TokenInfoDto {
	/**
	 * ID пользователя
	 */
	@ApiProperty({ description: 'ID пользователя', example: 123 })
	id: number;

	/**
	 * Email
	 */
	@ApiProperty({ description: 'Email пользователя', example: 'john@doe.com' })
	email: string;

	/**
	 * Роль пользователя
	 */
	@ApiProperty({
		description: 'Роль пользователя',
		example: 'USER',
		enum: UserRoles,
		enumName: 'UserRoles'
	})
	role: UserRoles;
}
