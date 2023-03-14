import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataScientistService } from '../services/data-scientist.service';

/**
 * Проверка ID нового менеджера аналитики
 */
@Injectable()
export class ManagerGuard implements CanActivate {
	constructor(private dataScientistManagerService: DataScientistService) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const req = context.switchToHttp().getRequest();

			return new Promise((resolve, reject) => {
				this.dataScientistManagerService
					.checkManager(req.body['managerId'])
					.then(managerResult => {
						if (managerResult) {
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
