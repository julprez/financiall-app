import sqlite3 from 'sqlite3';
declare const db: sqlite3.Database;
export declare const dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
export declare const dbGet: (sql: string, params?: any[]) => Promise<any>;
export declare const dbAll: (sql: string, params?: any[]) => Promise<any[]>;
export declare const initDatabase: () => Promise<void>;
export { db };
//# sourceMappingURL=init.d.ts.map