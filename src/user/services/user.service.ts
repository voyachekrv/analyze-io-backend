import {
	BadRequestException,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { format } from 'util';
import { TokenInfoDto } from '../dto/token-info.dto';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRoles, User } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserRepository } from '../repositories/user.repository';
import { UserStrings } from '../user.strings';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
		private readonly userMapper: UserMapper
	) {}

	public async findAll(): Promise<UserItemDto[]> {
		return (await this.userRepository.find()).map(entity =>
			this.userMapper.toItemDto(entity)
		);
	}

	public async findByEmail(email: string): Promise<User> {
		return await this.userRepository.findByEmail(email);
	}

	public async create(dto: UserCreateDto, role: UserRoles): Promise<User> {
		await this.verifyUniqueEmailOnCreate(dto.email);

		return await this.userRepository.save(
			this.userMapper.create(dto, role)
		);
	}

	private async verifyUniqueEmailOnCreate(email: string) {
		if (await this.userRepository.findByEmail(email)) {
			throw new BadRequestException(
				format(
					UserStrings.ALREADY_EXISTS_EMAIL,
					UserStrings.USER_NOMINATIVE,
					email
				)
			);
		}
	}

	private async verifyUniqueEmailOnUpdate(
		id: number,
		email: string
	): Promise<void> {
		const user = await this.userRepository.findByEmail(email);

		if (user) {
			if (user.id !== id && user.email === email) {
				throw new BadRequestException(
					format(
						UserStrings.ALREADY_EXISTS_EMAIL,
						UserStrings.USER_NOMINATIVE,
						email
					)
				);
			}
		}
	}

	private verifyUserDelete(bearer: string, ids: number[]): void {
		const user: TokenInfoDto = this.jwtService.verify(bearer);

		if (user.role !== UserRoles.ROOT) {
			if (!ids.includes(user.id) || ids.length > 1) {
				throw new ForbiddenException(
					UserStrings.CANNOT_DELETE_THIS_USER
				);
			}
		}
	}
}
