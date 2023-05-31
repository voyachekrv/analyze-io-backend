import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ReportStrings } from '../report.strings';

/**
 * Проверка на взаимосвязь отчета и пользователя, который его запрашивает
 */
@Injectable()
export class ReportUserRelationshipUpdateGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const req = context.switchToHttp().getRequest();
			const url = req.url as string;

			const reportId = Number(url.split('/').at(-2));
			const userId = req['user']['id'];

			const report = await this.prisma.report.findUniqueOrThrow({
				where: { id: reportId },
				include: { shop: true }
			});

			if (report.creatorId === userId) {
				return true;
			}

			if (report.shop.managerId === userId) {
				return true;
			}

			const analystOnShop =
				await this.prisma.analystsOnShop.findFirstOrThrow({
					where: {
						AND: [{ shopId: report.shop.id }, { analystId: userId }]
					}
				});

			if (analystOnShop) {
				return true;
			}

			throw new ForbiddenException(ReportStrings.FORBIDDEN);
		} catch (e) {
			throw new ForbiddenException(ReportStrings.FORBIDDEN);
		}
	}
}
