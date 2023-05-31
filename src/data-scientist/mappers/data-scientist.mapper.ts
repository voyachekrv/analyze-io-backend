import { Injectable } from '@nestjs/common';
import { UserMapper } from '../../user/mappers/user.mapper';
import { SubordinateChangeManagerResultDto } from '../dto/subordinate-change-manager-result.dto';
import { User } from '@prisma/client';
import { ManagerChangeResult } from '../types/manager-change-result.type';

/**
 * Маппер для подвида сущности Пользователь - аналитик
 */
@Injectable()
export class DataScientistMapper {
	/**
	 * Маппер для подвида сущности Пользователь - аналитик
	 * @param userMapper Маппер сущности Пользователь
	 */
	constructor(private readonly userMapper: UserMapper) {}

	/**
	 * Конвертация сущности в DTO результата смены менеджера
	 * @param input Сущность Пользователь
	 * @param manager Новый менеджер
	 * @returns DTO результата операции смены менеджера
	 */
	public toSubordinateChangeManagerResultDto(
		input: User | User[],
		manager: User
	): ManagerChangeResult {
		if (input['length']) {
			const results: SubordinateChangeManagerResultDto[] = [];

			(input as User[]).forEach(entity => {
				results.push(
					new SubordinateChangeManagerResultDto(
						this.userMapper.toItemDto(entity),
						this.userMapper.toItemDto(manager)
					)
				);
			});

			return results;
		}
		const singleEntity = input as User;

		return new SubordinateChangeManagerResultDto(
			this.userMapper.toItemDto(singleEntity),
			this.userMapper.toItemDto(manager)
		);
	}
}
