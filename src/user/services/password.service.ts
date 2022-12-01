import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

/**
 * Сервис для работы с паролем пользователя
 */
@Injectable()
export class PasswordService {
	/**
	 * Сервис для работы с паролем пользователя
	 * @param configService Сервис работы с конфигурационными файлами
	 */
	constructor(private readonly configService: ConfigService) {}

	/**
	 * Шифрование пароля
	 * @param password Пароль
	 * @returns Зашифрованный пароль
	 */
	public encrypt(password: string): string {
		return CryptoJS.AES.encrypt(
			password,
			this.configService.get<string>('PRIVATE_KEY')
		).toString();
	}

	/**
	 * Расшифровка пароля
	 * @param encryptedPassword Зашифрованный пароль
	 * @returns Расшифрованный пароль
	 */
	public decrypt(encryptedPassword: string): string {
		const bytes = CryptoJS.AES.decrypt(
			encryptedPassword,
			this.configService.get<string>('PRIVATE_KEY')
		);

		return bytes.toString(CryptoJS.enc.Utf8);
	}
}
