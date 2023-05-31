import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserRole } from '@prisma/client';
import { extractShopId } from '../../utils/extract-shop-id';
import { ShopService } from '../services/shop.service';
import { ShopStrings } from '../shop.strings';

/**
 * Проверка магазин на принадлежность менеджеру, делающему запрос
 */
@Injectable()
export class CheckShopAndStaffBelongingGuard implements CanActivate {
	/**
	 * Проверка магазин на принадлежность менеджеру, делающему запрос
	 * @param prisma Подключение к Prisma
	 * @param shopService Сервис сущности "Магазин"
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly shopService: ShopService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const req = context.switchToHttp().getRequest();
			const shopId = extractShopId(req.url as string);

			const shopExists = await this.shopService.checkShopExisting(
				req['user']['id'],
				shopId
			);

			const isOwnSubordinations = await this.checkSubordination(
				req['user']['id'],
				req.body['dataScientistIds']
			);

			if (shopExists && isOwnSubordinations) {
				return true;
			}
			throw new ForbiddenException(ShopStrings.FORBIDDEN);
		} catch (e) {
			throw new ForbiddenException(ShopStrings.FORBIDDEN);
		}
	}

	/**
	 * Проверка на нахождении аналитиков в подчинении менеджера
	 * @param managerId ID менеджера
	 * @param dataScientistIds ID аналитиков
	 * @returns Находятся ли все указанные аналитики в подчинении менеджера
	 */
	private async checkSubordination(
		managerId: number,
		dataScientistIds: number[]
	): Promise<boolean> {
		const dataScientists = await this.prisma.user.findMany({
			where: {
				AND: [
					{ role: UserRole.DATA_SCIENTIST },
					{ id: { in: dataScientistIds } }
				]
			}
		});

		dataScientists.forEach(dataScientist => {
			if (dataScientist.managerId !== managerId) {
				throw new ForbiddenException(ShopStrings.FORBIDDEN);
			}
		});

		return true;
	}
}
