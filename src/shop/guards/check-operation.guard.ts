import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ShopChangeStaffOperation } from '../enums/shop-change-staff-operation.enum';
import { ShopStrings } from '../shop.strings';

/**
 * Проверка на корректность запроса операции работы с персоналом магазина
 */
@Injectable()
export class CheckOperationGuard implements CanActivate {
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest();

		if (!req['query']['operation']) {
			throw new ForbiddenException(ShopStrings.FORBIDDEN);
		} else if (
			req['query']['operation'] !== ShopChangeStaffOperation.ADD &&
			req['query']['operation'] !== ShopChangeStaffOperation.REMOVE
		) {
			throw new ForbiddenException(ShopStrings.FORBIDDEN);
		} else {
			return true;
		}
	}
}
