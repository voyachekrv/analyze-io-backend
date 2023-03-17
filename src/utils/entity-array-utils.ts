/**
 * Операции с массивом сущностей
 */
export class EntityArrayUtils {
	/**
	 * Проверка на наличие сущности с заданным ID в заданном массиве
	 * @param array Массив сущностей
	 * @param id ID искомой сущности
	 * @returns Существует ли сущность с ID в массиве
	 */
	public static exists<T>(array: T[], id: number): boolean {
		if (array.filter(entity => entity['id'] === id).length > 0) {
			return true;
		}

		return false;
	}

	/**
	 * Удаление сущностей из массива по заданным ID
	 * @param array Массив сущностей
	 * @param ids ID сущностей для удаления
	 * @returns Массив без удаленных сущностей
	 */
	public static remove<T>(array: T[], ids: number[]): T[] {
		return array.filter(
			entity => !ids.some(toDelete => toDelete === entity['id'])
		);
	}
}
