import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log("Conectando a la base de datos...");

// Crear un mock de la base de datos para desarrollo
export const db = {
  query: async () => ({ rows: [] }),
  select: () => ({ from: () => [] }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ where: () => ({ returning: () => [] }) })
};

// Para mantener compatibilidad con el código existente
export const pool = {
  query: () => Promise.resolve({ rows: [] }),
  end: () => Promise.resolve()
};



