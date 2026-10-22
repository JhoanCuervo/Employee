/** Códigos estables que puede devolver la API. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "METHOD_NOT_ALLOWED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "INTERNAL_ERROR";

/** Error controlado con su código y el status lógico del contrato.
 * Apps Script siempre responde HTTP 200; `httpStatus` viaja en el JSON.
 */
export class ApiError extends Error {
  /** Crea un error controlado.
   * @param {ApiErrorCode} code Código estable para el cliente.
   * @param {number} httpStatus Status lógico que representa el error.
   * @param {string} message Mensaje legible para el cliente.
   * @param {string} [field] Campo que originó el error, si aplica.
   * @returns {void}
   */
  constructor(
    public readonly code: ApiErrorCode,
    public readonly httpStatus: number,
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Crea el error estándar de recurso inexistente.
   * @param {string} message Mensaje legible para el cliente.
   * @returns {ApiError} Error NOT_FOUND con status lógico 404.
   */
  static notFound(message: string): ApiError {
    return new ApiError("NOT_FOUND", 404, message);
  }
}

/** Error de validación asociado a un campo específico. */
export class FieldValidationError extends ApiError {
  /** Crea un error de validación.
   * @param {string} field Nombre del campo que no pasó la validación.
   * @param {string} message Mensaje que se devolverá en la respuesta.
   * @returns {void}
   */
  constructor(field: string, message: string) {
    super("VALIDATION_ERROR", 400, message, field);
    this.name = "FieldValidationError";
  }
}
