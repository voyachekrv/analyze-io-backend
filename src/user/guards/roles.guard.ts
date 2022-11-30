import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles-auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private jwtService: JwtService, private reflector: Reflector) {}

	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		try {
			const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
				context.getHandler(),
				context.getClass()
			]);

			if (!requiredRoles) {
				return true;
			}

			const req = context.switchToHttp().getRequest();
			const authHeader = req.headers.authorization;

			const bearer = authHeader.split(' ')[0];
			const token = authHeader.split(' ')[1];

			if (bearer === 'Bearer' && token) {
				const user = this.jwtService.verify(token);

				req.user = user;

				return requiredRoles.includes(user.role);
			}
		} catch (e) {
			throw new ForbiddenException('Forbidden');
		}
	}
}
