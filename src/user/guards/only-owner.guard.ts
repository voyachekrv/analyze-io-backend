import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRoles } from '../entities/user.entity';
import { UserRequestData } from '../types';
import { UserStrings } from '../user.strings';

/**
 * Проверка на осуществление операции с сущностью пользователя
 * либо самим пользователем, либо root-пользователем
 */
@Injectable()
export class OnlyOwnerGuard implements CanActivate {
	/**
	 * Возвращаемое значение указывает,
	 * разрешено ли выполнение текущего запроса.
	 * Возврат может быть либо синхронным (`boolean`),
	 * или асинхронный ("Promise" или "Observable")
	 * @param context Текущий контекст выполнения
	 * @returns Разрешить или отказать в выполнении запроса
	 */
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const user = context.switchToHttp().getRequest()
			.user as UserRequestData;
		const url = context.switchToHttp().getRequest().url as string;
		const userIdFromRequest = Number(url.at(-1));

		if (user.role !== UserRoles.ROOT) {
			if (user.id !== userIdFromRequest) {
				throw new ForbiddenException(UserStrings.CANNOT_PERMITE);
			} else {
				return true;
			}
		} else {
			return true;
		}
	}
}
