import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ShopRepository } from '../../commerce/repositories/shop.repository';
import { User } from '../../user/entities/user.entity';
import { EntityArrayUtils } from '../../utils/entity-array-utils';

/**
 * Проверка на возможность пользователя обновлять запись об отчете
 */
@Injectable()
export class DataScientistShopUpdateGuard implements CanActivate {
	constructor(private readonly shopRepository: ShopRepository) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const req = context.switchToHttp().getRequest();
			const url = req.url as string;

			const shopId = Number(url.split('/').at(-3));

			return new Promise((resolve, reject) => {
				this.shopRepository.findById(shopId).then(shop => {
					const existsResult = EntityArrayUtils.exists<User>(
						shop.analytics,
						req['user']['id']
					);

					if (existsResult) {
						resolve(true);
					} else {
						reject(new ForbiddenException());
					}
				});
			});
		} catch (e) {
			throw new ForbiddenException(
				'Нет разрешения на осуществление операции'
			);
		}
	}
}
