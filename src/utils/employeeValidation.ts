import type { EmployeeStatus, EmploymentType } from "../types/Employee";
import { FieldValidationError } from "./ApiError";
import { validateDate } from "./dateValidation";

/** Comprueba que el valor sea texto y no esté vacío.
 * @param {unknown} value Valor recibido en la solicitud.
 * @param {string} field Nombre del campo para reportar el error.
 * @param {string} label Nombre legible del campo.
 * @returns {string} Texto sin espacios al inicio ni al final.
 */
export const validateRequiredString = (
  value: unknown,
  field: string,
  label: string
): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new FieldValidationError(field, `${label} es obligatorio`);
  }

  return value.trim();
};

/** Valida que el teléfono tenga 10 dígitos y corresponda a un número colombiano.
 * @param {unknown} phone Teléfono recibido en la solicitud.
 * @returns {number} El teléfono validado.
 */
export const validatePhone = (phone: unknown): number => {
  if (typeof phone !== "number" || !Number.isSafeInteger(phone)) {
    throw new FieldValidationError(
      "phone",
      "El teléfono es obligatorio y debe enviarse como número de 10 dígitos (ejemplo: 3105550101)"
    );
  }

  const phoneDigits = String(phone);

  if (!/^\d{10}$/.test(phoneDigits) || !/^(3\d{9}|60\d{8})$/.test(phoneDigits)) {
    throw new FieldValidationError(
      "phone",
      "El teléfono debe ser un número colombiano válido de 10 dígitos (celular iniciado en 3 o fijo iniciado en 60)"
    );
  }

  return phone;
};

/** Deja el teléfono con el formato usado para mostrarlo en la API.
 * @param {number} phone Teléfono de 10 dígitos.
 * @returns {string} Teléfono con el indicativo de Colombia.
 */
export const formatPhone = (phone: number): string => {
  const digits = String(phone);
  return `+57 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/** Revisa que la fecha de contratación exista y venga en formato YYYY-MM-DD.
 * @param {unknown} hireDate Fecha recibida en la solicitud.
 * @returns {string} Fecha validada y sin espacios sobrantes.
 */
export const validateHireDate = (hireDate: unknown): string =>
  validateDate(hireDate, "hireDate", "La fecha de contratación");

/** Comprueba que un campo opcional sea texto.
 * @param {unknown} value Valor recibido en la solicitud.
 * @param {string} field Nombre del campo para reportar el error.
 * @param {string} label Nombre legible del campo.
 * @returns {string} Texto sin espacios al inicio ni al final.
 */
export const validateString = (
  value: unknown,
  field: string,
  label: string
): string => {
  if (typeof value !== "string") {
    throw new FieldValidationError(field, `${label} debe ser texto`);
  }

  return value.trim();
};

/** Comprueba que el tipo de contrato sea uno de los permitidos.
 * @param {unknown} value Tipo de contrato recibido en la solicitud.
 * @returns {EmploymentType} Tipo de contrato validado.
 */
export const validateEmploymentType = (value: unknown): EmploymentType => {
  const validTypes: EmploymentType[] = [
    "PERMANENT",
    "FIXED_TERM",
    "APPRENTICE",
  ];

  if (typeof value !== "string" || !validTypes.includes(value as EmploymentType)) {
    throw new FieldValidationError(
      "employmentType",
      "El tipo de contrato debe ser uno de estos valores: PERMANENT, FIXED_TERM o APPRENTICE"
    );
  }

  return value as EmploymentType;
};

/** Comprueba que el estado del empleado sea uno de los permitidos.
 * @param {unknown} value Estado recibido en la solicitud.
 * @returns {EmployeeStatus} Estado del empleado validado.
 */
export const validateEmployeeStatus = (
  value: unknown
): EmployeeStatus => {
  const validStatuses: EmployeeStatus[] = [
    "ACTIVE",
    "RETIRED",
    "ON_LEAVE",
  ];

  if (
    typeof value !== "string" ||
    !validStatuses.includes(value as EmployeeStatus)
  ) {
    throw new FieldValidationError(
      "status",
      "El estado debe ser uno de estos valores: ACTIVE, RETIRED o ON_LEAVE"
    );
  }

  return value as EmployeeStatus;
};
