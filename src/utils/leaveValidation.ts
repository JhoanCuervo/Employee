import { FieldValidationError } from "./ApiError";
import { validateDate } from "./dateValidation";
import type { LeaveRequestReviewStatus } from "../types/LeaveRequest";

/** Revisa que la fecha exista y venga en formato YYYY-MM-DD.
 * @param {unknown} value Fecha recibida en la solicitud.
 * @param {string} field Nombre del campo para reportar el error.
 * @param {string} label Nombre legible del campo.
 * @returns {string} Fecha validada y sin espacios sobrantes.
 */
export const validateLeaveDate = (
  value: unknown,
  field: string,
  label: string
): string => validateDate(value, field, label, true);

/** Comprueba que el estado de revisión sea APPROVED o REJECTED.
 * @param {unknown} value Estado recibido para la solicitud.
 * @returns {LeaveRequestReviewStatus} Estado validado.
 */
export const validateLeaveStatus = (
  value: unknown
): LeaveRequestReviewStatus => {
  const validStatuses: LeaveRequestReviewStatus[] = [
    "APPROVED",
    "REJECTED",
  ];

  if (
    typeof value !== "string" ||
    !validStatuses.includes(value as LeaveRequestReviewStatus)
  ) {
    throw new FieldValidationError(
      "status",
      "El estado debe ser APPROVED o REJECTED"
    );
  }

  return value as LeaveRequestReviewStatus;
};

/** Comprueba que los días solicitados sean un número mayor que cero.
 * @param {unknown} value Días recibidos en la solicitud.
 * @returns {number} Días validados.
 */
export const validateDaysRequested = (value: unknown): number => {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new FieldValidationError(
      "daysRequested",
      "Los días solicitados son obligatorios y deben ser un número mayor que cero"
    );
  }

  return value;
};
