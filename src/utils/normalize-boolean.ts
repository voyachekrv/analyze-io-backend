/**
 * Конвертация строки в булево значение с учетом семантики
 * @param str Строка для конвертации
 * @returns Булевское значение
 */
export const normalizeBoolean = (str: string | boolean): boolean => {
	if (!str) {
		return false;
	}

	let enhancedString: string | boolean;

	if (typeof str === 'string') {
		enhancedString = str.toLowerCase().trim();
	} else {
		enhancedString = str;
	}

	if (enhancedString === 'true') {
		return true;
	} else if (enhancedString === 'false') {
		return false;
	}

	return Boolean(enhancedString);
};
