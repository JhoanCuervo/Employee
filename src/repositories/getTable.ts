import type { OrmnTable } from "../types/Database";
import db from "./DatabaseContext";

/** Obtiene una tabla de ORMN o falla si la hoja no está configurada.
 * @param {string} name Nombre de la pestaña.
 * @returns {OrmnTable<T>} Tabla solicitada.
 */
export function getTable<T>(name: string): OrmnTable<T> {
  const table = db._getTables()[name];

  if (!table) {
    throw new Error(`No existe la pestaña ${name}`);
  }

  return table as OrmnTable<T>;
}
