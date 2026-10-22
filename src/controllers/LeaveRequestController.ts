import LeaveRequestService from "../services/LeaveRequestService";
import type {
  CreateLeaveRequestInput,
  LeaveRequestResponse,
  ReviewLeaveRequestInput,
  UpdateLeaveRequestInput,
} from "../types/LeaveRequest";
import { ApiError } from "../utils/ApiError";

/** Recibe las operaciones de solicitudes y maneja los casos no encontrados. */
export class LeaveRequestController {
  private service = new LeaveRequestService();

  /** Devuelve la solicitud o falla con NOT_FOUND si no existe.
   * @param {LeaveRequestResponse | null} leaveRequest Solicitud obtenida del servicio.
   * @returns {LeaveRequestResponse} Solicitud existente.
   */
  private orFail(
    leaveRequest: LeaveRequestResponse | null
  ): LeaveRequestResponse {
    if (!leaveRequest) {
      throw ApiError.notFound("Solicitud de permiso no encontrada");
    }

    return leaveRequest;
  }

  /** Devuelve la lista de solicitudes.
   * @returns {LeaveRequestResponse[]} Solicitudes con sus datos relacionados.
   */
  getAll(): LeaveRequestResponse[] {
    return this.service.getAll();
  }

  /** Busca una solicitud y falla si no existe.
   * @param {string} id Identificador de la solicitud.
   * @returns {LeaveRequestResponse} Solicitud encontrada con sus relaciones.
   */
  getById(id: string): LeaveRequestResponse {
    return this.orFail(this.service.getById(id));
  }

  /** Devuelve las solicitudes de un empleado.
   * @param {string} employeeId Identificador del empleado.
   * @returns {LeaveRequestResponse[]} Solicitudes encontradas con sus relaciones.
   */
  getByEmployeeId(employeeId: string): LeaveRequestResponse[] {
    return this.service.getByEmployeeId(employeeId);
  }

  /** Crea una solicitud con los datos recibidos.
   * @param {CreateLeaveRequestInput} body Datos enviados para crear la solicitud.
   * @returns {LeaveRequestResponse} Solicitud creada con sus relaciones.
   */
  create(body: CreateLeaveRequestInput): LeaveRequestResponse {
    return this.service.create(body);
  }

  /** Actualiza los datos de una solicitud existente.
   * @param {string} id Identificador de la solicitud.
   * @param {UpdateLeaveRequestInput} body Campos que se quieren actualizar.
   * @returns {LeaveRequestResponse} Solicitud actualizada con sus relaciones.
   */
  update(
    id: string,
    body: UpdateLeaveRequestInput
  ): LeaveRequestResponse {
    return this.orFail(this.service.update(id, body));
  }

  /** Cambia el estado de una solicitud pendiente.
   * @param {string} id Identificador de la solicitud.
   * @param {unknown} status Estado de revisión: APPROVED o REJECTED.
   * @param {ReviewLeaveRequestInput} body Revisor opcional que procesó la solicitud.
   * @returns {LeaveRequestResponse} Solicitud actualizada con sus relaciones.
   */
  changeStatus(
    id: string,
    status: unknown,
    body: ReviewLeaveRequestInput = {}
  ): LeaveRequestResponse {
    return this.orFail(
      this.service.changeStatus(id, status, body.reviewedBy)
    );
  }

  /** Elimina una solicitud y confirma la operación.
   * @param {string} id Identificador de la solicitud.
   * @returns {{ id: string, deleted: boolean }} Confirmación de eliminación.
   */
  delete(id: string): { id: string; deleted: boolean } {
    if (!this.service.delete(id)) {
      throw ApiError.notFound("Solicitud de permiso no encontrada");
    }

    return { id, deleted: true };
  }
}
