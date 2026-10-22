import EmployeeService from "../services/EmployeeService";
import type {
  CreateEmployeeInput,
  EmployeeResponse,
  UpdateEmployeeInput,
} from "../types/Employee";
import { ApiError } from "../utils/ApiError";

/** Recibe las operaciones de empleados y maneja los casos no encontrados. */
export class EmployeeController {
  private service = new EmployeeService();

  /** Devuelve el empleado o falla con NOT_FOUND si no existe.
   * @param {EmployeeResponse | null} employee Empleado obtenido del servicio.
   * @returns {EmployeeResponse} Empleado existente.
   */
  private orFail(employee: EmployeeResponse | null): EmployeeResponse {
    if (!employee) {
      throw ApiError.notFound("Empleado no encontrado");
    }

    return employee;
  }

  /** Devuelve la lista de empleados.
   * @returns {EmployeeResponse[]} Empleados con sus datos relacionados.
   */
  getAll(): EmployeeResponse[] {
    return this.service.getAll();
  }

  /** Busca un empleado y falla si no existe.
   * @param {string} id Identificador del empleado.
   * @returns {EmployeeResponse} Empleado encontrado con sus relaciones.
   */
  getById(id: string): EmployeeResponse {
    return this.orFail(this.service.getById(id));
  }

  /** Crea un empleado con los datos recibidos.
   * @param {CreateEmployeeInput} body Datos enviados para crear el empleado.
   * @returns {EmployeeResponse} Empleado creado con sus relaciones.
   */
  create(body: CreateEmployeeInput): EmployeeResponse {
    return this.service.create(body);
  }

  /** Actualiza los datos de un empleado existente.
   * @param {string} id Identificador del empleado.
   * @param {UpdateEmployeeInput} body Campos que se quieren actualizar.
   * @returns {EmployeeResponse} Empleado actualizado con sus relaciones.
   */
  update(id: string, body: UpdateEmployeeInput): EmployeeResponse {
    return this.orFail(this.service.update(id, body));
  }

  /** Cambia el estado de un empleado.
   * @param {string} id Identificador del empleado.
   * @param {unknown} status Estado: ACTIVE, RETIRED u ON_LEAVE.
   * @returns {EmployeeResponse} Empleado actualizado con sus relaciones.
   */
  changeStatus(id: string, status: unknown): EmployeeResponse {
    return this.orFail(this.service.changeStatus(id, status));
  }

  /** Elimina un empleado y confirma la operación.
   * @param {string} id Identificador del empleado.
   * @returns {{ id: string, deleted: boolean }} Confirmación de eliminación.
   */
  delete(id: string): { id: string; deleted: boolean } {
    if (!this.service.delete(id)) {
      throw ApiError.notFound("Empleado no encontrado");
    }

    return { id, deleted: true };
  }
}
