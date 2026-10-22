import { FieldValidationError } from "./ApiError";

/** Exige que un identificador no venga vacío.
 * @param {string} id Identificador recibido.
 * @param {string} label Nombre legible del recurso.
 * @returns {void}
 */
export function requireId(id: string, label: string): void {
  if (!id.trim()) {
    throw new FieldValidationError("id", `${label} es obligatorio`);
  }
}
