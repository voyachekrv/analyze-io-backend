import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class PasswordService {
	constructor(private readonly configService: ConfigService) {}

	public encrypt(password: string): string {
		return CryptoJS.AES.encrypt(
			password,
			this.configService.get<string>('PRIVATE_KEY')
		).toString();
	}

	public decrypt(encryptedPassword: string): string {
		const bytes = CryptoJS.AES.decrypt(
			encryptedPassword,
			this.configService.get<string>('PRIVATE_KEY')
		);

		return bytes.toString(CryptoJS.enc.Utf8);
	}
}
