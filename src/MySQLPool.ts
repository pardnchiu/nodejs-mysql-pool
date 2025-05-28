// TODO transform to npm package for other projects easily to use
import { createPool, Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";

interface MySQLConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  charset?: string;
  connectionLimit?: number;
};

class MySQLPool {
  private static config: Record<string, MySQLConfig> = {};

  private static readPool: Pool | null = null;
  private static writePool: Pool | null = null;

  private static tableName: string | null = null;
  private static selectAry: string[] = ["*"];
  private static joinAry: string[] = [];
  private static whereAry: string[] = [];
  private static bindingAry: any[] = [];
  private static orderAry: string[] = [];
  private static setAry: string[] = [];
  private static queryLimit: number | null = null;
  private static queryOffset: number | null = null;
  private static withTotal: boolean = false;
  private static currentTarget: "read" | "write" = "read";
  private static supportFunction = [
    "NOW()", "CURRENT_TIMESTAMP", "UUID()", "RAND()", "CURDATE()",
    "CURTIME()", "UNIX_TIMESTAMP()", "UTC_TIMESTAMP()", "SYSDATE()",
    "LOCALTIME()", "LOCALTIMESTAMP()", "PI()", "DATABASE()", "USER()",
    "VERSION()"
  ];

  private constructor() { };

  private static correctConfig(config: MySQLConfig) {
    return {
      host: String(config.host || "localhost").trim(),
      port: parseInt(String(config.port).trim()) || 3306,
      user: String(config.user || "root").trim(),
      password: String(config.password || "").trim(),
      database: String(config.database || "").trim(),
      charset: (config.charset || "utf8mb4").trim(),
      connectionLimit: parseInt(String(config.connectionLimit || 8).trim()) || 8
    } as MySQLConfig;
  }

  public static async init(config: Record<string, MySQLConfig> = {}): Promise<void> {
    this.config = config;

    let readConfig = this.correctConfig(config.config || config.read || {});
    let writeConfig = this.correctConfig(config.config || config.write || config.read || {});

    // const readConfig = {
    //   host: String(this.config.host || "localhost").trim(),
    //   port: parseInt(String(this.config.port).trim()) || 3306,
    //   user: String(this.config.user || "").trim(),
    //   password: String(this.config.password || "").trim(),
    //   database: String(process.env.DB_READ_DATABASE || "").trim(),
    //   charset: (process.env.DB_READ_CHARSET || "utf8mb4").trim(),
    //   connectionLimit: parseInt(process.env.DB_READ_CONNECTION || "8") || 8,
    //   waitForConnections: true
    // };

    // const writeConfig = {
    //   host: (process.env.DB_WRITE_HOST || "").trim(),
    //   port: parseInt(process.env.DB_WRITE_PORT || "3306") || 3306,
    //   user: (process.env.DB_WRITE_USER || "").trim(),
    //   password: process.env.DB_WRITE_PASSWORD || "",
    //   database: (process.env.DB_WRITE_DATABASE || "").trim(),
    //   charset: (process.env.DB_WRITE_CHARSET || "utf8mb4").trim(),
    //   connectionLimit: parseInt(process.env.DB_WRITE_CONNECTION || "4") || 4,
    //   waitForConnections: true
    // };

    try {
      if ((readConfig.database || "").length > 0) {
        this.readPool = createPool(readConfig);
        const connection = await this.readPool.getConnection();
        connection.release();
      };

      if ((writeConfig.database || "").length > 0) {
        this.writePool = createPool(writeConfig);
        const connection = await this.writePool.getConnection();
        connection.release();
      };
    }
    catch (err) {
      console.error("MySQL initialization failed:", err);
      throw err;
    };
  };

  public static async close(): Promise<void> {
    try {
      if (this.readPool) {
        await this.readPool.end();
        this.readPool = null;
      };

      if (this.writePool) {
        await this.writePool.end();
        this.writePool = null;
      };
    }
    catch (err) {
      console.error("Failed to close MySQL connections:", err);
      throw err;
    };
  };

  private static reset(): void {
    this.tableName = null;
    this.whereAry = [];
    this.bindingAry = [];
    this.orderAry = [];
    this.queryLimit = null;
    this.queryOffset = null;
    this.joinAry = [];
    this.selectAry = ["*"];
    this.setAry = [];
    this.withTotal = false;
    this.currentTarget = "read";
  };

  public static table(tableName: string, target: "read" | "write" = "read"): typeof MySQLPool {
    this.reset();
    this.tableName = tableName;
    this.currentTarget = target;

    return this;
  };

  public static total(): typeof MySQLPool {
    this.withTotal = true;
    return this;
  };

  public static select(...fields: string[]): typeof MySQLPool {
    if (fields.length > 0) {
      this.selectAry = fields;
    };
    return this;
  };

  public static innerJoin(table: string, first: string, operator: string, second?: string): typeof MySQLPool {
    return this.join("INNER", table, first, operator, second);
  };

  public static leftJoin(table: string, first: string, operator: string, second?: string): typeof MySQLPool {
    return this.join("LEFT", table, first, operator, second);
  };

  public static rightJoin(table: string, first: string, operator: string, second?: string): typeof MySQLPool {
    return this.join("RIGHT", table, first, operator, second);
  };

  private static join(type: string, table: string, first: string, operator: string, second?: string): typeof MySQLPool {
    if (second === undefined) {
      second = operator;
      operator = "=";
    };

    first = !first.includes(".") ? `\`${first}\`` : first;
    second = !second.includes(".") ? `\`${second}\`` : second;

    this.joinAry.push(`${type} JOIN \`${table}\` ON ${first} ${operator} ${second}`);
    return this;
  };

  public static where(column: string, operator: any, value?: any): typeof MySQLPool {
    if (operator === "LIKE" && typeof value === "string") {
      value = `%${value}%`;
    }
    else if (operator === "IN" && Array.isArray(value)) {
      value = value.map(v => v.toString());
    }
    else if (value == null) {
      value = operator;
      operator = "=";
    };

    column = !column.includes('(') && !column.includes(".") ? `\`${column}\`` : column;

    this.whereAry.push(`${column} ${operator} ${operator === "IN" ? "(?)" : "?"}`);
    this.bindingAry.push(value);

    return this;
  };

  public static orderBy(column: string, direction: "ASC" | "DESC" | "asc" | "desc" = "ASC"): typeof MySQLPool {
    direction = direction.toUpperCase() as "ASC" | "DESC" | "asc" | "desc";
    if ({
      ASC: 1,
      DESC: 1,
      asc: 1,
      desc: 1
    }[direction] == null) {
      console.error("Invalid order direction:", direction);
      return this;
    };

    column = !column.includes(".") ? `\`${column}\`` : column;
    this.orderAry.push(`${column} ${direction}`);

    return this;
  };

  public static limit(num: number): typeof MySQLPool {
    this.queryLimit = num;
    return this;
  };

  public static offset(num: number): typeof MySQLPool {
    this.queryOffset = num;
    return this;
  };

  public static increase(target: string, number?: number): typeof MySQLPool {
    this.setAry.push(`${target} = ${target} + ${number || 1}`);
    return this;
  };

  public static async get<T = any>(): Promise<T[]> {
    if (this.tableName === null) {
      throw new Error("Table not set, query aborted.");
    };

    const fieldName = this.selectAry.map(field => {
      field === "*" ? "*" : (!field.includes(".") ? `\`${field}\`` : field)

      switch (true) {
        case field === "*": return "*";
        case /[\.\(\)]+/.test(field): return field;
        default: return `\`${field}\``;
      };
    }).join(", ");

    let query = `SELECT ${fieldName} FROM \`${this.tableName}\``;

    if (this.joinAry.length > 0) {
      query += " " + this.joinAry.join(" ");
    };

    if (this.whereAry.length > 0) {
      query += " WHERE " + this.whereAry.join(" AND ");
    };

    if (this.withTotal) {
      query = `SELECT COUNT(*) OVER() AS total, data.* FROM (${query}) AS data`;
    };

    if (this.orderAry.length > 0) {
      query += " ORDER BY " + this.orderAry.join(", ");
    };

    if (this.queryLimit !== null) {
      query += ` LIMIT ${this.queryLimit}`;
    };

    if (this.queryOffset !== null) {
      query += ` OFFSET ${this.queryOffset}`;
    };

    return await this.query(query, this.bindingAry) as T[];
  };

  public static async insert(data: Record<string, any>): Promise<number | null> {
    if (this.tableName === null) {
      throw new Error("Table not set, insert aborted.");
    };

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = Array(values.length).fill('?');

    const query = `INSERT INTO \`${this.tableName}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders.join(", ")})`;

    const result = await this.query<ResultSetHeader>(query, values, "write");
    return result.insertId || null;
  };

  public static async update(data: Record<string, any> = {}): Promise<ResultSetHeader> {
    if (this.tableName === null) {
      throw new Error("Table not set, update aborted.");
    };

    const values: any[] = [];

    for (let [column, value] of Object.entries(data)) {
      column = !column.includes(".") ? `\`${column}\`` : column;

      if (typeof value === "string" && this.supportFunction.includes(value.toUpperCase())) {
        this.setAry.push(`${column} = ${value}`);
      }
      else {
        this.setAry.push(`${column} = ?`);
        values.push(value);
      };
    };

    let query = `UPDATE \`${this.tableName}\` SET ${this.setAry.join(", ")}`;

    if (this.whereAry.length > 0) {
      query += " WHERE " + this.whereAry.join(" AND ");
    };

    return await this.query<ResultSetHeader>(query, [...values, ...this.bindingAry], "write");
  };

  public static async upsert(data: Record<string, any>, updateData?: Record<string, any> | string): Promise<number | null> {
    if (this.tableName === null) {
      throw new Error("Table not set, upsert aborted.");
    };

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = Array(values.length).fill('?');
    const updateValues: any[] = [];

    let updateClause = "";

    if (typeof updateData === "string") {
      updateClause = ` ON DUPLICATE KEY UPDATE ${updateData}`;
    }
    else if (updateData && typeof updateData === "object") {
      const updateParts: string[] = [];

      for (let [column, value] of Object.entries(updateData)) {
        column = !column.includes(".") ? `\`${column}\`` : column;

        if (typeof value === "string" && this.supportFunction.includes(value.toUpperCase())) {
          updateParts.push(`${column} = ${value}`);
        }
        else {
          updateParts.push(`${column} = ?`);
          updateValues.push(value);
        }
      }

      updateClause = ` ON DUPLICATE KEY UPDATE ${updateParts.join(", ")}`;
    }
    else {
      updateClause = ` ON DUPLICATE KEY UPDATE ` +
        columns.map(col => {
          const column = !col.includes(".") ? `\`${col}\`` : col;
          return `${column} = VALUES(${column})`;
        }).join(", ");
    };

    const query = `INSERT INTO \`${this.tableName}\` (\`${columns.join("`, `")}\`) VALUES (${placeholders.join(", ")})${updateClause}`;

    const result = await this.query<ResultSetHeader>(query, [...values, ...updateValues], "write");
    return result.insertId || null;
  }

  public static async query<T = any>(query: string, params: any[] = [], target?: "read" | "write"): Promise<T> {
    const useTarget = target || this.currentTarget;
    const pool = useTarget === "write" ? this.writePool : this.readPool;

    if (!pool) {
      throw new Error(`${useTarget} connection is not available.`);
    };

    const startTime = Date.now();
    let connection: PoolConnection | null = null;

    try {
      connection = await pool.getConnection();
      const [results] = await connection.query(query, params);

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration > 20) {
        console.log(`[Slow Query: ${duration}ms] [${query}]`);
      };

      return results as T;
    }
    catch (error) {
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  };

  public static async read<T = any>(query: string, params: any[] = []): Promise<T> {
    if (!this.readPool) {
      throw new Error(`Read pool connection is not available.`);
    };
    return this.query<T>(query, params, "read");
  };

  public static async write<T = any>(query: string, params: any[] = []): Promise<T> {
    if (!this.writePool) {
      throw new Error(`Write pool connection is not available.`);
    };
    return this.query<T>(query, params, "write");
  };
}

process.on("SIGINT", async _ => {
  await MySQLPool.close();
  process.exit(0);
});

process.on("SIGTERM", async _ => {
  await MySQLPool.close();
  process.exit(0);
});

export default MySQLPool;