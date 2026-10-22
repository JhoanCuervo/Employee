/** Métodos que ORMN agrega a los registros guardados en una tabla. */
export type OrmnRecord<T> = T & {
  _save(): void;
  _delete(): void;
};

/** Operaciones disponibles para una tabla de ORMN. */
export interface OrmnTable<T> {
  _all(): { data: T[] };
  _find(id: string): OrmnRecord<T> | null | undefined;
  _findManyBy(field: string, value: unknown): { data: T[] };
  _create(data: T): OrmnRecord<T>;
}

/** Acceso a las tablas abiertas por ORMN. */
export interface OrmnDatabase {
  _getTables(): Record<string, unknown>;
}
