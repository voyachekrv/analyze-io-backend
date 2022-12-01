import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard для проверки bearer-токена
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	/**
	 * Guard для проверки bearer-токена
	 * @param jwtService Сервис для работы с JWT
	 */
	constructor(private jwtService: JwtService) {}

	/**
	 * Возвращаемое значение указывает,
	 * разрешено ли выполнение текущего запроса.
	 * Возврат может быть либо синхронным (`boolean`),
	 * или асинхронный ("Promise" или "Observable")
	 * @param context Текущий контекст выполнения
	 * @returns Разрешить или отказать в выполнении запроса
	 */
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const req = context.switchToHttp().getRequest();
			const authHeader = req.headers.authorization;

			const bearer = authHeader.split(' ')[0];
			const token = authHeader.split(' ')[1];

			if (bearer === 'Bearer' && token) {
				req.user = this.jwtService.verify(token);

				return true;
			}
		} catch (e) {
			throw new UnauthorizedException({
				message: 'User is not signed authorized'
			});
		}
	}
}
