import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ReportCreateDto } from '../dto/report.create.dto';
import { ReportStrings } from '../report.strings';

/**
 * Проверка на взаимосвязь магазина и пользователя, создающего для него отчет
 */
@Injectable()
export class UserShopRelationshipGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const dto = req['body'] as ReportCreateDto;

		const userId = req['user']['id'];

		const shop = await this.prisma.shop.findFirst({
			where: { managerId: userId }
		});

		if (shop) {
			return true;
		}

		const analystOnShop = await this.prisma.analystsOnShop.findFirst({
			where: {
				AND: [{ shopId: dto.shopId }, { analystId: userId }]
			}
		});

		if (analystOnShop) {
			return true;
		}

		throw new ForbiddenException(ReportStrings.FORBIDDEN);
	}
}
