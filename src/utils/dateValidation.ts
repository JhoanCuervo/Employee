import { FieldValidationError } from "./ApiError";

/** Revisa que una fecha exista y tenga formato YYYY-MM-DD.
 * @param {unknown} value Fecha recibida en la solicitud.
 * @param {string} field Campo que se reporta en el error.
 * @param {string} label Nombre legible del campo.
 * @param {boolean} [allowDateTime] Acepta un ISO 8601 y usa solo la fecha.
 * @returns {string} Fecha validada en formato YYYY-MM-DD.
 */
export function validateDate(
  value: unknown,
  field: string,
  label: string,
  allowDateTime = false
): string {
  if (typeof value !== "string") {
    throw new FieldValidationError(
      field,
      `${label} es obligatoria y debe tener el formato YYYY-MM-DD (ejemplo: 2022-08-01)`
    );
  }

  const normalizedInput = value.trim();
  const normalizedDate =
    allowDateTime && /^\d{4}-\d{2}-\d{2}T/.test(normalizedInput)
      ? normalizedInput.slice(0, 10)
      : normalizedInput;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    throw new FieldValidationError(
      field,
      `${label} debe tener el formato YYYY-MM-DD (ejemplo: 2022-08-01)`
    );
  }

  const parsedDate = new Date(`${normalizedDate}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== normalizedDate
  ) {
    throw new FieldValidationError(field, `${label} no es una fecha válida`);
  }

  return normalizedDate;
}
