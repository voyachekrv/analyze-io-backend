import { SubordinatePatchResultDto } from '../dto/subordinate-patch-result.dto';

/**
 * Тип результата смены менеджера у подчиненного -
 * результат может быть в виде массива, или в виде единственной сущности
 */
export type ManagerChangeResult =
	| SubordinatePatchResultDto
	| SubordinatePatchResultDto[];
