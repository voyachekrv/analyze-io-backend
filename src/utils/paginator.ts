import { SelectQueryBuilder } from 'typeorm';

/**
 * Данные для подготовки генерации страницы
 */
export interface PagePreparedData<T> {
	/**
	 * Список данных на странице
	 */
	list: T[];

	/**
	 * Общее число записей по запросу
	 */
	total: number;

	/**
	 * Общее число записей по запросу
	 */
	totalOnPage: number;

	/**
	 * Текущее количество записей на выбранной странице
	 */
	currentPage: number;

	/**
	 * Номер последней страницы
	 */
	lastPage: number;
}

/**
 * Условия поиска, на основе которых строится запрос
 */
export interface SearchConditions {
	/**
	 * Номер страницы
	 */
	page: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

/**
 * Пагинатор
 */
export interface Paginator<T, C> {
	/**
	 * Запрос данных, которые будут отображены на странице
	 * @param queryBuilder Построитель запроса
	 * @param searchConditions Условия поиска
	 * @returns  Данные для подготовки генерации страницы
	 */
	paginateQuery: (
		queryBuilder: SelectQueryBuilder<T>,
		searchConditions?: C
	) => Promise<PagePreparedData<T>>;
}
