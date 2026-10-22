import type { Position } from "../types/Position";
import { getTable } from "./getTable";

/** Lee los cargos guardados en la base de datos. */
export class PositionRepository {
  /** Devuelve todos los cargos guardados.
   * @returns {Position[]} Registros de la pestaña de cargos.
   */
  findAll(): Position[] {
    return getTable<Position>("Positions")._all().data as Position[];
  }

  /** Busca un cargo por su identificador.
   * @param {string} positionId Identificador del cargo.
   * @returns {Position | null} Cargo encontrado o null si no existe.
   */
  findById(id: string): Position | null {
    const table = getTable<Position>("Positions");

    return (table._find(id) as Position | null) ?? null;
  }
}
