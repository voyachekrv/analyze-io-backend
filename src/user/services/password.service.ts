import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtils } from '../../utils/crypto-utils';

/**
 * Сервис для работы с паролем пользователя
 */
@Injectable()
export class PasswordService {
	private cryptoUtils: CryptoUtils;

	/**
	 * Сервис для работы с паролем пользователя
	 * @param configService Сервис работы с конфигурационными файлами
	 */
	constructor(private readonly configService: ConfigService) {
		this.cryptoUtils = new CryptoUtils(
			this.configService.get<string>('AIO_PRIVATE_KEY')
		);
	}

	/**
	 * Шифрование пароля
	 * @param password Пароль
	 * @returns Зашифрованный пароль
	 */
	public encrypt(password: string): string {
		return this.cryptoUtils.encrypt(password);
	}

	/**
	 * Расшифровка пароля
	 * @param encryptedPassword Зашифрованный пароль
	 * @returns Расшифрованный пароль
	 */
	public decrypt(encryptedPassword: string): string {
		return this.cryptoUtils.decrypt(encryptedPassword);
	}
}
