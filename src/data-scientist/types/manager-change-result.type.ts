import { SubordinateChangeManagerResultDto } from '../dto/subordinate-change-manager-result.dto';

/**
 * Тип результата смены менеджера у подчиненного -
 * результат может быть в виде массива, или в виде единственной сущности
 */
export type ManagerChangeResult =
	| SubordinateChangeManagerResultDto
	| SubordinateChangeManagerResultDto[];
