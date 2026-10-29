type Exec = (sql: string, args?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowsAffected: number; lastInsertRowid?: bigint | number }>;
type Options = { root?: string; resetEvents?: boolean; log?: (msg: string) => void };
export declare function seedContent(exec: Exec, opts?: Options): Promise<{ adminCreated: boolean; adminMissing?: boolean }>;
export declare function seedOnce(exec: Exec, opts?: Options): Promise<void>;
