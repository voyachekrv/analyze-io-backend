import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ShopService } from './shop.service';
import { AvatarToolsService } from '../../avatar-tools/avatar-tools.service';
import { AvatarPath } from '../../utils/avatar-path.type';

/**
 * Сервис для работы с аватарами магазина
 */
@Injectable()
export class ShopAvatarService {
	/**
	 * Сервис для работы с аватарами магазина
	 * @param prisma Подключение к Prisma
	 * @param shopService Сервис для работы с магазином
	 * @param avatarToolsService Сервис для работы с аватарами
	 */
	constructor(
		private readonly prisma: PrismaService,
		private readonly shopService: ShopService,
		private readonly avatarToolsService: AvatarToolsService
	) {}

	/**
	 * Загрузка аватара магазина
	 * @param file Файл картинки
	 * @param managerId ID менеджера
	 * @param shopId ID магазина
	 * @returns URL загруженного аватара
	 */
	public async loadShopAvatar(
		file: Express.Multer.File,
		managerId: number,
		shopId: number
	): Promise<AvatarPath> {
		Logger.log(
			`change user avatar, user: ${shopId}, file: ${file.filename}`,
			this.constructor.name
		);

		const shop = await this.shopService.findEntityById(managerId, shopId);

		if (shop.avatar) {
			await this.avatarToolsService.clearPreviousAvatar(shop.avatar);
		}

		const newAvatar =
			await this.avatarToolsService.moveFileToPermanentStorage(
				file,
				'shop-avatars'
			);

		await this.prisma.shop.update({
			where: { id: shopId },
			data: newAvatar
		});

		return newAvatar;
	}
}
