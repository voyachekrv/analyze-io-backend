import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AvatarPath } from '../../utils/avatar-path.type';
import { UserService } from './user.service';
import { AvatarToolsService } from '../../avatar-tools/avatar-tools.service';

/**
 * Сервис для работы с аватарами пользователя
 */
@Injectable()
export class UserAvatarService {
	/**
	 * Сервис для работы с аватарами пользователя
	 * @param prisma Подключение к Prisma
	 * @param userService Сервис для работы с пользователями
	 * @param avatarToolsService Сервис инструментов работы с аватарами
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
		private readonly avatarToolsService: AvatarToolsService
	) {}

	/**
	 * Загрузка пользовательского аватара
	 * @param file Файл картинки
	 * @param userId ID пользователя
	 * @returns URL загруженного аватара
	 */
	public async loadUserAvatar(
		file: Express.Multer.File,
		userId: number
	): Promise<AvatarPath> {
		Logger.log(
			`change user avatar, user: ${userId}, file: ${file.filename}`,
			this.constructor.name
		);

		const user = await this.userService.findEntityById(userId);

		if (user.avatar) {
			await this.avatarToolsService.clearPreviousAvatar(user.avatar);
		}

		const newAvatar =
			await this.avatarToolsService.moveFileToPermanentStorage(
				file,
				'avatars'
			);

		await this.prisma.user.update({
			where: { id: userId },
			data: newAvatar
		});

		return newAvatar;
	}
}
