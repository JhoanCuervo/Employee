import { LeaveRequestRepository } from "../repositories/LeaveRequestRepository";
import type {
  LeaveRequest,
  LeaveRequestResponse,
  CreateLeaveRequestInput,
  UpdateLeaveRequest,
  UpdateLeaveRequestInput,
} from "../types/LeaveRequest";

import {
  validateRequiredString,
  validateString,
} from "../utils/employeeValidation";
import { ApiError, FieldValidationError } from "../utils/ApiError";
import { requireId } from "../utils/requireId";
import {
  validateDaysRequested,
  validateLeaveDate,
  validateLeaveStatus,
} from "../utils/leaveValidation";
import { formatEmployeeSummary } from "../utils/employeeFormatter";
import { formatDate } from "../utils/dateFormatter";

import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { LeaveTypeRepository } from "../repositories/LeaveTypeRepository";
import type { Employee } from "../types/Employee";
import type { LeaveType } from "../types/LeaveType";

/** Aplica las reglas de negocio y validación para las solicitudes de permiso. */
class LeaveRequestService {
  private repository = new LeaveRequestRepository();
  private employeeRepository = new EmployeeRepository();
  private leaveTypeRepository = new LeaveTypeRepository();

  /** Trae todas las solicitudes y agrega la información de sus relaciones.
   * @returns {LeaveRequestResponse[]} Lista de solicitudes con empleado y tipo de permiso.
   */
  getAll(): LeaveRequestResponse[] {
    const leaveRequests = this.repository.findAll();

    const employees = new Map(
      this.employeeRepository.findAll().map((e) => [e.id, e]),
    );
    const leaveTypes = new Map(
      this.leaveTypeRepository
        .findAll()
        .map((t) => [t.id, t]),
    );

    return leaveRequests.map((leaveRequest) => {
      const employee = leaveRequest.employeeId
        ? (employees.get(leaveRequest.employeeId) ?? null)
        : null;
      const reviewerId = leaveRequest.reviewedBy?.trim();
      const reviewer = reviewerId
        ? (employees.get(reviewerId) ?? null)
        : null;
      const leaveType = leaveRequest.leaveTypeId
        ? (leaveTypes.get(leaveRequest.leaveTypeId) ?? null)
        : null;

      return this.toResponse(leaveRequest, employee, reviewer, leaveType);
    });
  }

  /** Busca una solicitud por su identificador.
   * @param {string} id Identificador de la solicitud.
   * @returns {LeaveRequestResponse | null} Solicitud encontrada o null si no existe.
   */
  getById(id: string): LeaveRequestResponse | null {
    requireId(id, "El ID de la solicitud");

    const leaveRequest = this.repository.findById(id);
    return leaveRequest ? this.withRelations(leaveRequest) : null;
  }

  /** Busca las solicitudes de un empleado.
   * @param {string} employeeId Identificador del empleado.
   * @returns {LeaveRequestResponse[]} Solicitudes encontradas con sus relaciones.
   */
  getByEmployeeId(employeeId: string): LeaveRequestResponse[] {
    const id = validateRequiredString(
      employeeId,
      "employeeId",
      "El empleado",
    );

    const leaveRequests = this.repository.findByEmployeeId(id);

    const leaveTypes = new Map(
      this.leaveTypeRepository
        .findAll()
        .map((t) => [t.id, t]),
    );
    const employees = new Map(
      this.employeeRepository.findAll().map((e) => [e.id, e]),
    );
    const employee = employees.get(id) ?? null;

    return leaveRequests.map((leaveRequest) => {
      const reviewerId = leaveRequest.reviewedBy?.trim();
      const reviewer = reviewerId
        ? (employees.get(reviewerId) ?? null)
        : null;
      const leaveType = leaveRequest.leaveTypeId
        ? (leaveTypes.get(leaveRequest.leaveTypeId) ?? null)
        : null;

      return this.toResponse(leaveRequest, employee, reviewer, leaveType);
    });
  }

  /** Valida y guarda una solicitud nueva.
   * @param {CreateLeaveRequestInput} data Datos necesarios para crear la solicitud.
   * @returns {LeaveRequestResponse} Solicitud creada con sus relaciones.
   */
  create(data: CreateLeaveRequestInput): LeaveRequestResponse {
    const employeeId = validateRequiredString(
      data.employeeId,
      "employeeId",
      "El empleado",
    );
    const leaveTypeId = validateRequiredString(
      data.leaveTypeId,
      "leaveTypeId",
      "El tipo de permiso",
    );
    const startDate = validateLeaveDate(
      data.startDate,
      "startDate",
      "La fecha de inicio",
    );
    const endDate = validateLeaveDate(
      data.endDate,
      "endDate",
      "La fecha de fin",
    );
    const daysRequested = validateDaysRequested(data.daysRequested);
    const reason = validateRequiredString(
      data.reason,
      "reason",
      "El motivo",
    );
    const requestedAt = validateLeaveDate(
      data.requestedAt,
      "requestedAt",
      "La fecha de solicitud",
    );
    const reviewedBy =
      data.reviewedBy === undefined
        ? ""
        : validateString(data.reviewedBy, "reviewedBy", "El revisor");

    const leaveRequest = this.repository.create({
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      daysRequested,
      reason,
      reviewedBy,
      requestedAt,
    });

    return this.withRelations(leaveRequest);
  }

  /** Valida y aplica los cambios indicados para una solicitud.
   * @param {string} id Identificador de la solicitud que se actualizará.
   * @param {UpdateLeaveRequestInput} data Campos que se van a modificar.
   * @returns {LeaveRequestResponse | null} Solicitud actualizada o null si no existe.
   */
  update(
    id: string,
    data: UpdateLeaveRequestInput
  ): LeaveRequestResponse | null {
    requireId(id, "El ID de la solicitud");

    if ("id" in data) {
      throw new FieldValidationError("id", "No se puede modificar el ID");
    }

    const changes: UpdateLeaveRequest = {};

    if (data.employeeId !== undefined) {
      changes.employeeId = validateRequiredString(
        data.employeeId,
        "employeeId",
        "El empleado",
      );
    }

    if (data.leaveTypeId !== undefined) {
      changes.leaveTypeId = validateRequiredString(
        data.leaveTypeId,
        "leaveTypeId",
        "El tipo de permiso",
      );
    }

    if (data.startDate !== undefined) {
      changes.startDate = validateLeaveDate(
        data.startDate,
        "startDate",
        "La fecha de inicio",
      );
    }

    if (data.endDate !== undefined) {
      changes.endDate = validateLeaveDate(
        data.endDate,
        "endDate",
        "La fecha de fin",
      );
    }

    if (data.daysRequested !== undefined) {
      changes.daysRequested = validateDaysRequested(data.daysRequested);
    }

    if (data.reason !== undefined) {
      changes.reason = validateRequiredString(
        data.reason,
        "reason",
        "El motivo",
      );
    }

    if (data.reviewedBy !== undefined) {
      changes.reviewedBy = validateString(
        data.reviewedBy,
        "reviewedBy",
        "El revisor",
      );
    }

    if (data.requestedAt !== undefined) {
      changes.requestedAt = validateLeaveDate(
        data.requestedAt,
        "requestedAt",
        "La fecha de solicitud",
      );
    }

    const leaveRequest = this.repository.update(id, changes);
    return leaveRequest ? this.withRelations(leaveRequest) : null;
  }

  /** Aprueba o rechaza una solicitud que esté pendiente.
   * @param {string} id Identificador de la solicitud.
   * @param {unknown} status Estado de revisión: APPROVED o REJECTED.
   * @param {unknown} reviewedBy Revisor opcional que procesó la solicitud.
   * @returns {LeaveRequestResponse | null} Solicitud actualizada o null si no existe.
   */
  changeStatus(
    id: string,
    status: unknown,
    reviewedBy?: unknown
  ): LeaveRequestResponse | null {
    requireId(id, "El ID de la solicitud");

    const newStatus = validateLeaveStatus(status);

    const leaveRequest = this.repository.findById(id);

    if (!leaveRequest) {
      return null;
    }

    if (leaveRequest.status !== "PENDING") {
      throw new ApiError(
        "CONFLICT",
        409,
        "Solo se puede aprobar o rechazar una solicitud PENDING",
        "status"
      );
    }

    const changes: UpdateLeaveRequest = { status: newStatus };

    if (reviewedBy !== undefined) {
      changes.reviewedBy = validateString(
        reviewedBy,
        "reviewedBy",
        "El revisor"
      );
    }

    const updated = this.repository.update(id, changes);
    return updated ? this.withRelations(updated) : null;
  }

  /** Elimina una solicitud usando su identificador.
   * @param {string} id Identificador de la solicitud.
   * @returns {boolean} true si se eliminó; false si no se encontró.
   */
  delete(id: string): boolean {
    requireId(id, "El ID de la solicitud");

    return this.repository.delete(id);
  }

  /** Completa los datos de la solicitud con empleado y tipo de permiso.
   * @param {LeaveRequest} leaveRequest Registro base de la solicitud.
   * @returns {LeaveRequestResponse} Solicitud junto con la información relacionada.
   */
  private withRelations(
    leaveRequest: LeaveRequest
  ): LeaveRequestResponse {
    const employee = leaveRequest.employeeId
      ? this.employeeRepository.findById(leaveRequest.employeeId)
      : null;

    const leaveType = leaveRequest.leaveTypeId
      ? this.leaveTypeRepository.findById(leaveRequest.leaveTypeId)
      : null;

    const reviewerId = leaveRequest.reviewedBy?.trim();
    const reviewer = reviewerId
      ? this.employeeRepository.findById(reviewerId)
      : null;

    return this.toResponse(leaveRequest, employee, reviewer, leaveType);
  }

  private toResponse(
    leaveRequest: LeaveRequest,
    employee: Employee | null,
    reviewer: Employee | null,
    leaveType: LeaveType | null,
  ): LeaveRequestResponse {
    const { _rowIndex, leaveTypeId: _leaveTypeId, ...base } = leaveRequest;

    return {
      ...base,
      startDate: formatDate(leaveRequest.startDate),
      endDate: formatDate(leaveRequest.endDate),
      requestedAt: formatDate(leaveRequest.requestedAt),
      employee: formatEmployeeSummary(employee),
      reviewer: formatEmployeeSummary(reviewer),
      name: leaveType?.name ?? "",
      description: leaveType?.description ?? "",
    };
  }
}
export default LeaveRequestService;