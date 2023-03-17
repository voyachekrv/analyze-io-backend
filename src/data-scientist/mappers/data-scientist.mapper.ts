import { Injectable } from '@nestjs/common';
import { UserMapper } from '../../user/mappers/user.mapper';
import { SubordinatePatchResultDto } from '../dto/subordinate-patch-result.dto';
import { User } from '../../user/entities/user.entity';
import { ManagerChangeResult } from '../types/manager-change-result.type';

/**
 * Маппер для подвида сущности Пользователь - аналитик
 */
@Injectable()
export class DataScientistMapper {
	constructor(private readonly userMapper: UserMapper) {}

	/**
	 * Конвертация сущности в DTO результата смены менеджера
	 * @param entity Сущность Пользователь
	 * @returns DTO результата операции смены менеджера
	 */
	public toPatchResultDto(input: User | User[]): ManagerChangeResult {
		if (input['length']) {
			const results: SubordinatePatchResultDto[] = [];

			(input as User[]).forEach(entity => {
				results.push(
					new SubordinatePatchResultDto(
						this.userMapper.toItemDto(entity),
						this.userMapper.toItemDto(entity.manager)
					)
				);
			});

			return results;
		}
		const singleEntity = input as User;

		return new SubordinatePatchResultDto(
			this.userMapper.toItemDto(singleEntity),
			this.userMapper.toItemDto(singleEntity.manager)
		);
	}
}
