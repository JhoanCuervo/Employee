import type {
  LeaveRequest,
  CreateLeaveRequest,
  UpdateLeaveRequest,
} from "../types/LeaveRequest";
import { getTable } from "./getTable";

/** Se encarga de leer y modificar los registros de solicitudes de permiso. */
export class LeaveRequestRepository {
  /** Devuelve todas las solicitudes guardadas.
   * @returns {LeaveRequest[]} Registros de solicitudes de permiso.
   */
  findAll(): LeaveRequest[] {
    const table = getTable<LeaveRequest>("LeaveRequests");

    return table._all().data as LeaveRequest[];
  }

  /** Busca una solicitud por su identificador.
   * @param {string} id Identificador de la solicitud.
   * @returns {LeaveRequest | null} Solicitud encontrada o null si no existe.
   */
  findById(id: string): LeaveRequest | null {
    const table = getTable<LeaveRequest>("LeaveRequests");

    return (table._find(id) as LeaveRequest | null) ?? null;
  }

  /** Devuelve las solicitudes de un empleado.
   * @param {string} employeeId Identificador del empleado.
   * @returns {LeaveRequest[]} Solicitudes encontradas.
   */
  findByEmployeeId(employeeId: string): LeaveRequest[] {
    const table = getTable<LeaveRequest>("LeaveRequests");

    return table._findManyBy("employeeId", employeeId).data as LeaveRequest[];
  }

  /** Guarda una solicitud nueva y le asigna ID y estado inicial.
   * @param {CreateLeaveRequest} data Datos de la solicitud a guardar.
   * @returns {LeaveRequest} Registro creado.
   */
  create(data: CreateLeaveRequest): LeaveRequest {
    const table = getTable<LeaveRequest>("LeaveRequests");

    const leaveRequest: LeaveRequest = {
      ...data,
      id: `LR-${Utilities.getUuid()}`,
      status: "PENDING",
    };

    return table._create(leaveRequest) as LeaveRequest;
  }

  /** Actualiza los campos indicados de una solicitud.
   * @param {string} id Identificador de la solicitud.
   * @param {UpdateLeaveRequest} changes Cambios que se aplicarán.
   * @returns {LeaveRequest | null} Solicitud actualizada o null si no existe.
   */
  update(
    id: string,
    changes: UpdateLeaveRequest
  ): LeaveRequest | null {
    const table = getTable<LeaveRequest>("LeaveRequests");
    const leaveRequest = table._find(id);

    if (!leaveRequest) {
      return null;
    }

    Object.assign(leaveRequest, changes);
    leaveRequest._save();

    return leaveRequest as LeaveRequest;
  }

  /** Elimina una solicitud de la tabla.
   * @param {string} id Identificador de la solicitud.
   * @returns {boolean} true si se eliminó; false si no se encontró.
   */
  delete(id: string): boolean {
    const table = getTable<LeaveRequest>("LeaveRequests");
    const leaveRequest = table._find(id);

    if (!leaveRequest) {
      return false;
    }

    leaveRequest._delete();

    return true;
  }
}
