import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserStrings } from '../user.strings';
import { UserRequestData } from '../dto/token/user-request-data.type';

/**
 * Проверка на получение DTO обновления пользователя
 * либо самим пользователем, либо root-пользователем
 */
@Injectable()
export class OnlyOwnerGetForUpdateGuard implements CanActivate {
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
		const userIdFromRequest = Number(url.split('/').at(-2));

		if (user.id !== userIdFromRequest) {
			throw new ForbiddenException(UserStrings.CANNOT_PERMITE);
		} else {
			return true;
		}
	}
}
