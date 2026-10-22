import type {
  Employee,
  CreateEmployee,
  UpdateEmployee,
} from "../types/Employee";
import { getTable } from "./getTable";

/** Se encarga de leer y modificar los registros de empleados. */
export class EmployeeRepository {
  /** Devuelve todos los empleados guardados.
   * @returns {Employee[]} Registros de empleados.
   */
  findAll(): Employee[] {
    const table = getTable<Employee>("Employees");

    return table._all().data as Employee[];
  }

  /** Busca un empleado por su identificador.
   * @param {string} id Identificador del empleado.
   * @returns {Employee | null} Empleado encontrado o null si no existe.
   */
  findById(id: string): Employee | null {
    const table = getTable<Employee>("Employees");

    return (table._find(id) as Employee | null) ?? null;
  }

  /** Guarda un empleado nuevo y le asigna ID y estado inicial.
   * @param {CreateEmployee} data Datos del empleado a guardar.
   * @returns {Employee} Registro creado.
   */
  create(data: CreateEmployee): Employee {
    const table = getTable<Employee>("Employees");

    const employee: Employee = {
      ...data,
      id: `EMP-${Utilities.getUuid()}`,
      status: "ACTIVE",
    };

    return table._create(employee) as Employee;
  }

  /** Actualiza los campos indicados de un empleado.
   * @param {string} id Identificador del empleado.
   * @param {UpdateEmployee} changes Cambios que se aplicarán.
   * @returns {Employee | null} Empleado actualizado o null si no existe.
   */
  update(
    id: string,
    changes: UpdateEmployee
  ): Employee | null {
    const table = getTable<Employee>("Employees");
    const employee = table._find(id);

    if (!employee) {
      return null;
    }

    Object.assign(employee, changes);
    employee._save();

    return employee as Employee;
  }

  /** Elimina un empleado de la tabla.
   * @param {string} id Identificador del empleado.
   * @returns {boolean} true si se eliminó; false si no se encontró.
   */
  delete(id: string): boolean {
    const table = getTable<Employee>("Employees");
    const employee = table._find(id);

    if (!employee) {
      return false;
    }

    employee._delete();

    return true;
  }
}
