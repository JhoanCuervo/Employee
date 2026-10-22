import type { OrmnDatabase } from "./Database";

declare global {
  const global: {
    doGet: typeof doGet;
    doPost: typeof doPost;
  };

  // ORMN está disponible globalmente en el entorno de Apps Script.
  const ORMN: {
    openDb(id?: string): OrmnDatabase;
  };
}

export {};
