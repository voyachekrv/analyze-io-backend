import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { CreationResultDto } from 'src/utils/creation-result.dto';
import { Roles } from '../decorators/roles-auth.decorator';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserItemDto } from '../dto/user.item.dto';
import { UserRoles } from '../entities/user.entity';
import { RolesGuard } from '../guards/roles.guard';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserRoles.USER, UserRoles.ROOT)
	public async index(): Promise<UserItemDto[]> {
		return await this.userService.findAll();
	}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserRoles.ROOT)
	@UsePipes(new ValidationPipe())
	public async create(
		@Body() dto: UserCreateDto
	): Promise<CreationResultDto> {
		return {
			id: (await this.userService.create(dto, UserRoles.ROOT)).id
		};
	}
}
