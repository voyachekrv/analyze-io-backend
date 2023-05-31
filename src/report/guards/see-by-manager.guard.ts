import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ReportStrings } from '../report.strings';

/**
 * Проверка на менеджера, который просматривает отчет
 */
@Injectable()
export class SeeByManagerGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const url = req.url as string;

		const reportId = Number(url.split('/').at(-2));
		const userId = req['user']['id'];

		const report = await this.prisma.report.findUniqueOrThrow({
			where: { id: reportId },
			include: { shop: true }
		});

		if (report.shop.managerId === userId) {
			return true;
		}

		throw new ForbiddenException(ReportStrings.FORBIDDEN);
	}
}
