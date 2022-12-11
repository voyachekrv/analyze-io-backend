import { PagePreparedData } from './paginator';

/**
 * Страница
 */
export class Page<T> {
	/**
	 * Список объектов на странице
	 */
	public list: T[] | object[] = [];

	/**
	 * Номер предыдущей странцы
	 */
	public previous: number;

	/**
	 * Номер следующей странцы
	 */
	public next: number;

	/**
	 * Всего объектов найдено по данному запросу
	 */
	public readonly total: number;

	/**
	 * Всего страниц
	 */
	public readonly totalPages: number;

	/**
	 * Всего объектов на странице
	 */
	public readonly totalOnPage: number;

	/**
	 * Номер текущей страницы
	 */
	public readonly current: number;

	/**
	 * Номер последней страницы
	 */
	public readonly last: number;

	/**
	 * Номер первой страницы
	 */
	public readonly first: number = 0;

	/**
	 * Страница
	 * @param data Данные для подготовки генерации страницы
	 */
	constructor(data: PagePreparedData<T>) {
		this.list = data.list;
		this.total = data.total;
		this.totalPages = data.lastPage + 1;
		this.totalOnPage = data.totalOnPage;
		this.current = data.currentPage;
		this.last = data.lastPage;

		const calculatedPrev = this.current - 1 < 0 ? null : this.current - 1;
		const calculatedNext =
			this.current + 1 > data.lastPage ? null : this.current + 1;

		this.previous = calculatedPrev;
		this.next = calculatedNext;
	}

	/**
	 * Преобразование объектов на странице
	 * @param mapper Маппер объектов
	 * @returns Страница с преобразованным типом объектов после маппинга
	 */
	public map(mapper: (entity: T) => object): Page<T | object> {
		this.list = this.list.map(entity => mapper(entity));

		return this;
	}
}
