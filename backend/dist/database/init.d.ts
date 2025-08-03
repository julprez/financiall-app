import sqlite3 from 'sqlite3';
declare const db: sqlite3.Database;
export declare const dbRun: (arg1: string) => Promise<unknown>;
export declare const dbGet: (arg1: string) => Promise<unknown>;
export declare const dbAll: (arg1: string) => Promise<unknown>;
export declare const initDatabase: () => Promise<void>;
export { db };
//# sourceMappingURL=init.d.ts.map