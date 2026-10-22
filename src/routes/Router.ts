import { EmployeeController } from "../controllers/EmployeeController";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "../types/Employee";
import type {
  CreateLeaveRequestInput,
  ReviewLeaveRequestInput,
  UpdateLeaveRequestInput,
} from "../types/LeaveRequest";
import { ApiError, FieldValidationError } from "../utils/ApiError";

type HttpMethod = "GET" | "POST";
type ApiEvent =
  | GoogleAppsScript.Events.DoGet
  | GoogleAppsScript.Events.DoPost;
type RequestBody = Record<string, unknown> & {
  id?: string;
  leaveTypeId?: string;
};

const employees = new EmployeeController();
const leaveRequests = new LeaveRequestController();

const EMPLOYEE_ID_REQUIRED = "El ID del empleado es obligatorio";
const LEAVE_REQUEST_ID_REQUIRED = "El ID de la solicitud es obligatorio";
const STATUS_IN_BODY =
  "El status debe enviarse en el cuerpo de la solicitud, no en la URL";

/** Convierte un dato en la respuesta JSON que espera Apps Script.
 * @param {unknown} data Contenido que se enviará al cliente.
 * @returns {GoogleAppsScript.Content.TextOutput} Respuesta con MIME type JSON.
 */
function json(data: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Indica si un parámetro viajó en la URL, incluso si viene vacío.
 * @param {ApiEvent} e Datos de la solicitud.
 * @param {string} name Nombre del parámetro.
 * @returns {boolean} true si el parámetro está presente.
 */
function hasQueryParam(e: ApiEvent, name: string): boolean {
  if (Object.prototype.hasOwnProperty.call(e.parameter, name)) {
    return true;
  }

  const queryString = e.queryString ?? "";
  return new RegExp(`(?:^|&)${name}(?:=|&|$)`).test(queryString);
}

/** Exige que el cuerpo de un POST venga como JSON.
 * @param {GoogleAppsScript.Events.DoPost} e Evento POST de Apps Script.
 * @returns {void}
 */
function requireJsonContentType(
  e: GoogleAppsScript.Events.DoPost
): void {
  if (!e.postData) {
    return;
  }

  const contentType = (e.postData.type ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw new ApiError(
      "UNSUPPORTED_MEDIA_TYPE",
      415,
      "El Content-Type debe ser application/json"
    );
  }
}

/** Lee y convierte el cuerpo JSON de una solicitud POST.
 * @param {GoogleAppsScript.Events.DoPost} e Evento POST de Apps Script.
 * @returns {RequestBody} Objeto enviado en el cuerpo; si viene vacío, devuelve un objeto vacío.
 */
function readBody(e: GoogleAppsScript.Events.DoPost): RequestBody {
  const contents = e.postData?.contents;

  if (!contents) {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(contents) as unknown;
  } catch {
    throw new ApiError(
      "BAD_REQUEST",
      400,
      "El cuerpo de la solicitud debe ser un JSON válido"
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new ApiError(
      "BAD_REQUEST",
      400,
      "El cuerpo de la solicitud debe ser un objeto JSON"
    );
  }

  return parsed as RequestBody;
}

/** Exige un identificador para operaciones sobre un registro existente.
 * @param {unknown} value Identificador recibido en el cuerpo JSON.
 * @param {string} message Mensaje de error que se devuelve si falta el ID.
 * @param {string} field Campo que se reporta en el error.
 * @returns {string} Identificador sin espacios sobrantes.
 */
function requireId(
  value: unknown,
  message: string,
  field = "id"
): string {
  const id = typeof value === "string" ? value.trim() : "";

  if (!id) {
    throw new FieldValidationError(field, message);
  }

  return id;
}

/** Exige que el identificador venga en el cuerpo JSON y no en la URL.
 * @param {unknown} queryId Identificador recibido como parámetro de la URL.
 * @param {unknown} bodyId Identificador recibido en el cuerpo JSON.
 * @param {string} message Mensaje de error que se devuelve si falta el ID.
 * @returns {string} Identificador sin espacios sobrantes.
 */
function requireBodyId(
  queryId: unknown,
  bodyId: unknown,
  message: string
): string {
  if (typeof queryId === "string" && queryId.trim()) {
    throw new ApiError(
      "BAD_REQUEST",
      400,
      "El ID debe enviarse en el cuerpo de la solicitud, no en la URL",
      "id"
    );
  }

  return requireId(bodyId, message);
}

/** Rechaza un valor que deba viajar en el cuerpo y llegue por la URL.
 * @param {unknown} value Valor recibido como parámetro de la URL.
 * @param {string} field Campo que se reporta en el error.
 * @param {string} message Mensaje de error que se devuelve.
 * @returns {void}
 */
function rejectQueryParam(
  value: unknown,
  field: string,
  message: string
): void {
  if (typeof value === "string" && value.trim()) {
    throw new ApiError("BAD_REQUEST", 400, message, field);
  }
}

/** Atiende las operaciones de empleados.
 * @param {HttpMethod} method Método HTTP que recibió Apps Script.
 * @param {ApiEvent} e Datos de la solicitud.
 * @returns {unknown} Resultado de la operación.
 */
function handleEmployees(
  method: HttpMethod,
  e: ApiEvent
): unknown {
  const { id, action } = e.parameter;

  if (method === "GET") {
    if (action) {
      throw new ApiError(
        "METHOD_NOT_ALLOWED",
        405,
        `La acción ${action} requiere una solicitud POST`
      );
    }

    if (hasQueryParam(e, "id")) {
      return employees.getById(
        requireId(id, EMPLOYEE_ID_REQUIRED)
      );
    }

    return employees.getAll();
  }

  const body = readBody(
    e as GoogleAppsScript.Events.DoPost
  );

  switch (action) {
    case "create":
      return employees.create(body as unknown as CreateEmployeeInput);

    case "update": {
      const { id: _id, ...changes } = body;
      return employees.update(
        requireBodyId(id, body.id, EMPLOYEE_ID_REQUIRED),
        changes as unknown as UpdateEmployeeInput
      );
    }

    case "delete":
      return employees.delete(
        requireBodyId(id, body.id, EMPLOYEE_ID_REQUIRED)
      );

    case "changeStatus":
      rejectQueryParam(e.parameter.status, "status", STATUS_IN_BODY);

      return employees.changeStatus(
        requireBodyId(id, body.id, EMPLOYEE_ID_REQUIRED),
        body.status
      );

    default:
      throw new ApiError(
        "BAD_REQUEST",
        400,
        "Acción inválida. Usa create, update, delete o changeStatus"
      );
  }
}

/** Atiende las operaciones de solicitudes de permiso.
 * @param {HttpMethod} method Método HTTP que recibió Apps Script.
 * @param {ApiEvent} e Datos de la solicitud.
 * @returns {unknown} Resultado de la operación.
 */
function handleLeaveRequests(
  method: HttpMethod,
  e: ApiEvent
): unknown {
  const { id, employeeId, action } = e.parameter;

  if (method === "GET") {
    if (action) {
      throw new ApiError(
        "METHOD_NOT_ALLOWED",
        405,
        `La acción ${action} requiere una solicitud POST`
      );
    }

    const hasId = hasQueryParam(e, "id");
    const hasEmployeeId = hasQueryParam(e, "employeeId");

    if (hasId && hasEmployeeId) {
      throw new ApiError(
        "BAD_REQUEST",
        400,
        "Usa id o employeeId, no ambos"
      );
    }

    if (hasId) {
      return leaveRequests.getById(
        requireId(id, LEAVE_REQUEST_ID_REQUIRED)
      );
    }

    if (hasEmployeeId) {
      return leaveRequests.getByEmployeeId(
        requireId(
          employeeId,
          "El employeeId es obligatorio",
          "employeeId"
        )
      );
    }

    return leaveRequests.getAll();
  }

  const body = readBody(
    e as GoogleAppsScript.Events.DoPost
  );

  switch (action) {
    case "create":
      return leaveRequests.create(
        body as unknown as CreateLeaveRequestInput
      );

    case "update": {
      const { id: _id, ...changes } = body;
      return leaveRequests.update(
        requireBodyId(id, body.id, LEAVE_REQUEST_ID_REQUIRED),
        changes as unknown as UpdateLeaveRequestInput
      );
    }

    case "delete":
      return leaveRequests.delete(
        requireBodyId(id, body.id, LEAVE_REQUEST_ID_REQUIRED)
      );

    case "changeStatus":
      rejectQueryParam(e.parameter.status, "status", STATUS_IN_BODY);

      return leaveRequests.changeStatus(
        requireBodyId(id, body.id, LEAVE_REQUEST_ID_REQUIRED),
        body.status,
        body as unknown as ReviewLeaveRequestInput
      );

    default:
      throw new ApiError(
        "BAD_REQUEST",
        400,
        "Acción inválida. Usa create, update, delete o changeStatus"
      );
  }
}

/** Busca la ruta solicitada y delega la operación al controlador.
 * @param {HttpMethod} method Método HTTP que recibió Apps Script.
 * @param {ApiEvent} e Datos de la solicitud.
 * @returns {GoogleAppsScript.Content.TextOutput} Resultado o error en formato JSON.
 */
export function handleRequest(
  method: HttpMethod,
  e: ApiEvent
): GoogleAppsScript.Content.TextOutput {
  try {
    if (method === "POST") {
      requireJsonContentType(
        e as GoogleAppsScript.Events.DoPost
      );
    }

    const { path } = e.parameter;

    if (!path) {
      throw new ApiError(
        "BAD_REQUEST",
        400,
        "El parámetro path es obligatorio"
      );
    }

    let result: unknown;

    switch (path) {
      case "employees":
        result = handleEmployees(method, e);
        break;

      case "leaveRequests":
        result = handleLeaveRequests(method, e);
        break;

      default:
        throw new ApiError("NOT_FOUND", 404, "Ruta no encontrada");
    }

    return json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return json({
        success: false,
        httpStatus: error.httpStatus,
        code: error.code,
        error: error.message,
        ...(error.field ? { field: error.field } : {}),
      });
    }

    console.error(error);

    return json({
      success: false,
      httpStatus: 500,
      code: "INTERNAL_ERROR",
      error: "Error interno",
    });
  }
}
