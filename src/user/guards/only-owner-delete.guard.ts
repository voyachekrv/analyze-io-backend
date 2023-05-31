import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteDto } from '../../utils/delete.dto';
import { UserStrings } from '../user.strings';
import { UserRequestData } from '../dto/token/user-request-data.type';

/**
 * Проверка на удаление пользователя либо самим пользователем, либо root-пользователем
 */
@Injectable()
export class OnlyOwnerDeleteGuard implements CanActivate {
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
		const body = context.switchToHttp().getRequest().body as DeleteDto;

		if (!body?.ids.includes(user.id) || body?.ids.length > 1) {
			throw new ForbiddenException(UserStrings.CANNOT_DELETE_THIS_USER);
		} else {
			return true;
		}
	}
}
