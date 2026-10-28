export declare const schema: string[];
export declare const columns: [string, string, string][];
export declare function applySchema(run: (sql: string) => Promise<{ rows: Record<string, unknown>[] }>): Promise<void>;
