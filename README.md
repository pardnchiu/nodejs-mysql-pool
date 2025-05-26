# MySQLPool

A TypeScript/JavaScript MySQL connection pool library with query builder functionality, supporting both read and write database connections.

[![npm](https://img.shields.io/npm/v/@pardnchiu/mysql-pool)](https://www.npmjs.com/package/@pardnchiu/mysql-pool)

## Features

- **Dual Connection Pools**: Separate read and write database connections
- **Query Builder**: Fluent interface for building SQL queries
- **Environment Configuration**: Easy setup using environment variables
- **Connection Management**: Automatic connection pooling and cleanup
- **TypeScript Support**: Full TypeScript definitions included
- **Slow Query Detection**: Automatic logging of queries taking over 20ms
- **JOIN Operations**: Support for INNER, LEFT, and RIGHT joins
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **UPSERT Support**: Insert or update on duplicate key

## Installation

```bash
npm install @pardnchiu/mysqlpool
```

## Environment Configuration

Set up your database connections using environment variables:

### Read Database (Optional)
```env
DB_READ_HOST=localhost
DB_READ_PORT=3306
DB_READ_USER=read_user
DB_READ_PASSWORD=read_password
DB_READ_DATABASE=your_database
DB_READ_CHARSET=utf8mb4
DB_READ_CONNECTION=8
```

### Write Database (Required for write operations)
```env
DB_WRITE_HOST=localhost
DB_WRITE_PORT=3306
DB_WRITE_USER=write_user
DB_WRITE_PASSWORD=write_password
DB_WRITE_DATABASE=your_database
DB_WRITE_CHARSET=utf8mb4
DB_WRITE_CONNECTION=4
```

## Quick Start

```javascript
import MySQLPool from '@pardnchiu/mysql-pool';

// Initialize the connection pools
await MySQLPool.init();

// Simple query
const users = await MySQLPool
  .table("users")
  .where("status", "active")
  .get();

// Close connections when done
await MySQLPool.close();
```

## API Reference

### Initialization

#### `init(): Promise<void>`
Initialize the database connection pools.

```javascript
await MySQLPool.init();
```

#### `close(): Promise<void>`
Close all database connections.

```javascript
await MySQLPool.close();
```

### Query Builder Methods

#### `table(tableName: string, target?: "read" | "write"): MySQLPool`
Set the target table and connection type.

```javascript
MySQLPool.table("users");           // Uses read connection
MySQLPool.table("users", "write");  // Uses write connection
```

#### `select(...fields: string[]): MySQLPool`
Specify columns to select.

```javascript
MySQLPool.table("users").select("id", "name", "email");
MySQLPool.table("users").select("COUNT(*) as total");
```

#### `where(column: string, operator: any, value?: any): MySQLPool`
Add WHERE conditions.

```javascript
// Basic where
MySQLPool.table("users").where("id", 1);
MySQLPool.table("users").where("age", ">", 18);

// LIKE operator (automatically adds % wildcards)
MySQLPool.table("users").where('name', "LIKE", "John");

// IN operator
MySQLPool.table("users").where("id", "IN", [1, 2, 3]);
```

#### JOIN Operations

```javascript
// INNER JOIN
MySQLPool.table("users")
  .innerJoin("profiles", "users.id", "profiles.user_id");

// LEFT JOIN
MySQLPool.table("users")
  .leftJoin("orders", "users.id", "orders.user_id");

// RIGHT JOIN with custom operator
MySQLPool.table("users")
  .rightJoin("posts", "users.id", "!=", "posts.author_id");
```

#### `orderBy(column: string, direction?: "ASC" | "DESC"): MySQLPool`
Add ORDER BY clause.

```javascript
MySQLPool.table("users").orderBy("created_at", "DESC");
MySQLPool.table("users").orderBy("name"); // Defaults to ASC
```

#### `limit(num: number): MySQLPool`
Limit the number of results.

```javascript
MySQLPool.table("users").limit(10);
```

#### `offset(num: number): MySQLPool`
Skip a number of records.

```javascript
MySQLPool.table("users").offset(20).limit(10); // Pagination
```

#### `total(): MySQLPool`
Include total count in results (adds COUNT(*) OVER()).

```javascript
const results = await MySQLPool
  .table("users")
  .total()
  .limit(10)
  .get();
// Results will include 'total' field with complete count
```

### Data Operations

#### `get<T>(): Promise<T[]>`
Execute SELECT query and return results.

```javascript
const users = await MySQLPool
  .table("users")
  .where("status", "active")
  .orderBy("created_at", "DESC")
  .get();
```

#### `insert(data: Record<string, any>): Promise<number | null>`
Insert a new record.

```javascript
const userId = await MySQLPool
  .table("users")
  .insert({
    name: "John Doe",
    email: "john@example.com",
    created_at: "NOW()"
  });
```

#### `update(data?: Record<string, any>): Promise<ResultSetHeader>`
Update existing records.

```javascript
// Update with data
const result = await MySQLPool
  .table("users")
  .where("id", 1)
  .update({
    name: "Jane Doe",
    updated_at: "NOW()"
  });

// Update using increase() method
await MySQLPool
  .table("users")
  .where("id", 1)
  .increase("login_count", 1)
  .update();
```

#### `upsert(data: Record<string, any>, updateData?: Record<string, any> | string): Promise<number | null>`
Insert or update on duplicate key.

```javascript
// Simple upsert (updates all fields)
const id = await MySQLPool
  .table("users")
  .upsert({
    email: "john@example.com",
    name: "John Doe",
    login_count: 1
  });

// Upsert with specific update data
const id2 = await MySQLPool
  .table("users")
  .upsert(
    { email: "john@example.com", name: "John Doe", login_count: 1 },
    { updated_at: "NOW()" }
  );
```

### Raw Queries

#### `read<T>(query: string, params?: any[]): Promise<T>`
Execute read query using read pool.

```javascript
const users = await MySQLPool.read(`
SELECT COUNT(*) as total 
FROM users 
WHERE status = ?
`, ['active']);
```

#### `write<T>(query: string, params?: any[]): Promise<T>`
Execute write query using write pool.

```javascript
const result = await MySQLPool.write(`
UPDATE users 
SET last_login = NOW() 
WHERE id = ?
`, [userId]);
```

## Advanced Examples

### Complex Query with Joins and Conditions

```javascript
const reports = await MySQLPool
  .table("orders")
  .select("orders.id", "users.name", "products.title", "orders.total")
  .innerJoin("users", "orders.user_id", "users.id")
  .leftJoin("order_items", "orders.id", "order_items.order_id")
  .leftJoin("products", "order_items.product_id", "products.id")
  .where("orders.status", "completed")
  .where("orders.created_at", ">", "2023-01-01")
  .orderBy("orders.created_at", "DESC")
  .limit(50)
  .get();
```

### Pagination with Total Count

```javascript
const page = 1;
const perPage = 10;

const results = await MySQLPool
  .table("users")
  .select("id", "name", "email", "created_at")
  .where("status", "active")
  .total()
  .orderBy("created_at", "DESC")
  .limit(perPage)
  .offset((page - 1) * perPage)
  .get();

console.log(`total: ${results[0]?.total || 0}`);
console.log(`page: ${page}`);
```

### Transaction-like Operations

```javascript
try {
  // Create user
  const userId = await MySQLPool
    .table("users", "write")
    .insert({
      name: "John Doe",
      email: "john@example.com"
    });

  // Create user profile
  await MySQLPool
    .table("profiles", "write")
    .insert({
      user_id: userId,
      bio: "Software Developer",
      avatar: "avatar.jpg"
    });

  console.log("created successfully");
} catch (error) {
  console.error("failed to create:", error);
}
```

## Supported MySQL Functions

The following MySQL functions are supported in update operations:

- `NOW()`
- `CURRENT_TIMESTAMP`
- `UUID()`
- `RAND()`
- `CURDATE()`
- `CURTIME()`
- `UNIX_TIMESTAMP()`
- `UTC_TIMESTAMP()`
- `SYSDATE()`
- `LOCALTIME()`
- `LOCALTIMESTAMP()`
- `PI()`
- `DATABASE()`
- `USER()`
- `VERSION()`

## Error Handling

```javascript
try {
  await MySQLPool.init();
  
  const users = await MySQLPool
    .table("users")
    .where("invalid_column", "value")
    .get();
    
} catch (error) {
  console.error("error:", error.message);
} finally {
  await MySQLPool.close();
}
```

## Performance Features

- **Connection Pooling**: Automatic connection reuse
- **Slow Query Detection**: Queries over 20ms are automatically logged
- **Prepared Statements**: All queries use parameterized statements to prevent SQL injection
- **Connection Management**: Automatic connection release after each query

## License

This source code project is licensed under the [MIT](https://github.com/pardnltd-tools/blob/main/LICENSE) license.

## Creator

<img src="https://avatars.githubusercontent.com/u/25631760" align="left" width="96" height="96" style="margin-right: 0.5rem;">

<h4 style="padding-top: 0">邱敬幃 Pardn Chiu</h4>

<a href="mailto:dev@pardn.io" target="_blank">
    <img src="https://pardn.io/image/email.svg" width="48" height="48">
</a> <a href="https://linkedin.com/in/pardnchiu" target="_blank">
    <img src="https://pardn.io/image/linkedin.svg" width="48" height="48">
</a>

***

©️ 2025 [邱敬幃 Pardn Chiu](https://pardn.io)