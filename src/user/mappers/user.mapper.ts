import { Injectable } from '@nestjs/common';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { User, UserRoles } from '../entities/user.entity';
import { PasswordService } from '../services/password.service';

@Injectable()
export class UserMapper {
	constructor(private passwordService: PasswordService) {}

	public toItemDto(entity: User): UserItemDto {
		return new UserItemDto(entity.id, entity.email);
	}

	public create(dto: UserCreateDto, role: UserRoles): User {
		return new User(
			dto.email,
			this.passwordService.encrypt(dto.password),
			role
		);
	}
}
