import type {
  LeaveType,
  CreateLeaveType,
  UpdateLeaveType,
} from "../types/LeaveType";
import { getTable } from "./getTable";

/** Se encarga de leer y modificar los registros de tipos de permiso. */
export class LeaveTypeRepository {
  /** Devuelve todos los tipos de permiso guardados.
   * @returns {LeaveType[]} Registros de tipos de permiso.
   */
  findAll(): LeaveType[] {
    const table = getTable<LeaveType>("LeaveTypes");

    return table._all().data as LeaveType[];
  }

  /** Busca un tipo de permiso por su identificador.
   * @param {string} id Identificador del tipo de permiso.
   * @returns {LeaveType | null} Tipo de permiso encontrado o null si no existe.
   */
  findById(id: string): LeaveType | null {
    const table = getTable<LeaveType>("LeaveTypes");

    return (table._find(id) as LeaveType | null) ?? null;
  }

  /** Guarda un tipo de permiso nuevo y le asigna ID.
   * @param {CreateLeaveType} data Datos del tipo de permiso a guardar.
   * @returns {LeaveType} Registro creado.
   */
  create(data: CreateLeaveType): LeaveType {
    const table = getTable<LeaveType>("LeaveTypes");

    const leaveType: LeaveType = {
      ...data,
      id: `LT-${Utilities.getUuid()}`,
    };

    return table._create(leaveType) as LeaveType;
  }

  /** Actualiza los campos indicados de un tipo de permiso.
   * @param {string} id Identificador del tipo de permiso.
   * @param {UpdateLeaveType} changes Cambios que se aplicarán.
   * @returns {LeaveType | null} Tipo de permiso actualizado o null si no existe.
   */
  update(
    id: string,
    changes: UpdateLeaveType
  ): LeaveType | null {
    const table = getTable<LeaveType>("LeaveTypes");
    const leaveType = table._find(id);

    if (!leaveType) {
      return null;
    }

    Object.assign(leaveType, changes);
    leaveType._save();

    return leaveType as LeaveType;
  }

  /** Elimina un tipo de permiso de la tabla.
   * @param {string} id Identificador del tipo de permiso.
   * @returns {boolean} true si se eliminó; false si no se encontró.
   */
  delete(id: string): boolean {
    const table = getTable<LeaveType>("LeaveTypes");
    const leaveType = table._find(id);

    if (!leaveType) {
      return false;
    }

    leaveType._delete();

    return true;
  }
}
