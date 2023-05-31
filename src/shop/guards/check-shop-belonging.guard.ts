import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { extractShopId } from '../../utils/extract-shop-id';
import { ShopService } from '../services/shop.service';
import { ShopStrings } from '../shop.strings';

/**
 * Проверака на магазин в подчинении у указанного менеджера
 */
@Injectable()
export class CheckShopBelongingGuard implements CanActivate {
	/**
	 * Проверка магазин на принадлежность менеджеру, делающему запрос
	 * @param shopService Сервис сущности "Магазин"
	 */
	constructor(private readonly shopService: ShopService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const shopId = extractShopId(req.url as string);

		const shopExists = await this.shopService.checkShopExisting(
			req['user']['id'],
			shopId
		);

		if (shopExists) {
			return true;
		}
		throw new ForbiddenException(ShopStrings.FORBIDDEN);
	}
}
