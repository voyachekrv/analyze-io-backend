import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { ShopRepository } from '../../commerce/repositories/shop.repository';
import { Observable } from 'rxjs';

/**
 * Проверка на возможность менеджера просматривать отчет
 */
@Injectable()
export class ManagerShopGuard implements CanActivate {
	constructor(private readonly shopRepository: ShopRepository) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const req = context.switchToHttp().getRequest();
			const url = req.url as string;

			const shopId = Number(url.split('/').at(-4));

			return new Promise((resolve, reject) => {
				this.shopRepository
					.findById(shopId)
					.then(shop => {
						if (shop.user.id === req['user']['id']) {
							resolve(true);
						} else {
							reject(new ForbiddenException());
						}
					})
					.catch(e => {
						reject(new ForbiddenException(e));
					});
			});
		} catch (e) {
			throw new ForbiddenException(
				`Нет разрешения на выполнение операции, ${e.message}`
			);
		}
	}
}
