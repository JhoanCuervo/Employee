import type { Department } from "../types/Department";
import { getTable } from "./getTable";

/** Lee los departamentos guardados en la base de datos. */
export class DepartmentRepository {
  /** Devuelve todos los departamentos.
   * @returns {Department[]} Registros de la pestaña de departamentos.
   */
  findAll(): Department[] {
    return getTable<Department>("Departments")._all().data as Department[];
  }

  /** Busca un departamento por su identificador.
   * @param {string} departmentId Identificador del departamento.
   * @returns {Department | null} Departamento encontrado o null si no existe.
   */
  findById(departmentId: string): Department | null {
    const table = getTable<Department>("Departments");

    return (table._find(departmentId) as Department | null) ?? null;
  }
}
