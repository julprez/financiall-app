// Añadir soporte para PostgreSQL
import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // PostgreSQL para producción
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // SQLite para desarrollo (mantener actual)
}