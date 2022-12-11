import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ValidateQueryParamGuard implements CanActivate {
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const query = context.switchToHttp().getRequest().query;

		const pageNumber = Number(query.page);

		if (isNaN(pageNumber)) {
			throw new BadRequestException('Номер страницы должен быть числом');
		}

		if (pageNumber < 0) {
			throw new BadRequestException(
				'Номер страницы должен положительным быть числом'
			);
		}

		if (!Number.isInteger(pageNumber)) {
			throw new BadRequestException(
				'Номер страницы должен быть целым числом'
			);
		}

		return true;
	}
}
