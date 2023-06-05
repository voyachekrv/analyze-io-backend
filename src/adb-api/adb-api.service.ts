import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckResult } from '@nestjs/terminus';
import { AxiosResponse } from 'axios';
import { AppVersion } from './interface';

/**
 * Сервис взаимодействия с API сервера аналитической БД
 */
@Injectable()
export class AdbApiService {
	/**
	 * Сервис взаимодействия с API сервера аналитической БД
	 * @param httpService Сервис для подключения к стороннему ресурсу по HTTP
	 * @param configService Сервис конфигурации
	 */
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService
	) {}

	/**
	 * Построение пути к эндпоинту
	 * @param paths Пути к ресурсу
	 * @returns Полный пусть к эндпоинту
	 */
	private getApiAddress(...paths: string[]): string {
		return `${this.configService.get(
			'AIO_ADB_SERVER_ADDR'
		)}api/${paths.join('/')}`;
	}

	/**
	 * Запрос к HTTP-ресурсу и обработка ошибок
	 * @param address Адрес, на который производится запрос
	 * @returns Тело запроса
	 */
	private async fetchData(address: string): Promise<unknown> {
		let response: AxiosResponse;

		try {
			response = await this.httpService.axiosRef.get(address);

			if (response.status >= 400) {
				throw new HttpException(response.statusText, response.status);
			}

			return response.data;
		} catch (e) {
			throw new HttpException(response.statusText, response.status);
		}
	}

	/**
	 * Получение версии приложения
	 * @returns Версия приложения
	 */
	public async version(): Promise<AppVersion> {
		const response = await this.fetchData(
			this.getApiAddress('health', 'version')
		);

		return response as AppVersion;
	}

	/**
	 * HealthCheck приложения
	 * @returns Результат HealthCheck-a приложения
	 */
	public async health(): Promise<HealthCheckResult> {
		const response = await this.fetchData(this.getApiAddress('health'));

		return response as HealthCheckResult;
	}
}
