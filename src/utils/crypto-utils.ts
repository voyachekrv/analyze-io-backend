import * as CryptoJS from 'crypto-js';

/**
 * Шифрование строки по заданному ключу
 */
export class CryptoUtils {
	/**
	 * Ключ шифрования
	 */
	private key: string;

	/**
	 * Шифрование строки по заданному ключу
	 * @param key Ключ для шифрования
	 */
	constructor(key: string) {
		this.key = key;
	}

	/**
	 * Шифрование строки
	 * @param str Строка для шифрования
	 * @returns Зашифрованная строка
	 */
	public encrypt(str: string): string {
		return CryptoJS.AES.encrypt(str, this.key).toString();
	}

	/**
	 * Расшифровка строки
	 * @param encryptedPassword  Зашифрованная строка
	 * @returns Расшифрованная строка
	 */
	public decrypt(encryptedStr: string): string {
		const bytes = CryptoJS.AES.decrypt(encryptedStr, this.key);

		return bytes.toString(CryptoJS.enc.Utf8);
	}
}
