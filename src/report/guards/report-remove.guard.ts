import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { DeleteDto } from '../../utils/delete.dto';
import { PrismaService } from '../../prisma.service';
import { ReportStrings } from '../report.strings';

/**
 * Проверка возможности удалить отчеты
 */
@Injectable()
export class ReportRemoveGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const userId = req['user']['id'];
		const dto = req['body'] as DeleteDto;

		(
			await this.prisma.report.findMany({
				where: { id: { in: dto.ids } },
				include: { shop: true }
			})
		)
			.map(report => report.shop)
			.forEach(shop => {
				if (shop.managerId !== userId) {
					throw new ForbiddenException(ReportStrings.FORBIDDEN);
				}
			});

		return true;
	}
}
