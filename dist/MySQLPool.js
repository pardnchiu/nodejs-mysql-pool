"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO transform to npm package for other projects easily to use
var promise_1 = require("mysql2/promise");
var MySQLPool = /** @class */ (function () {
    function MySQLPool() {
    }
    ;
    MySQLPool.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readConfig, writeConfig, connection, connection, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        readConfig = {
                            host: (process.env.DB_READ_HOST || "").trim(),
                            port: parseInt(process.env.DB_READ_PORT || "3306") || 3306,
                            user: (process.env.DB_READ_USER || "").trim(),
                            password: process.env.DB_READ_PASSWORD || "",
                            database: (process.env.DB_READ_DATABASE || "").trim(),
                            charset: (process.env.DB_READ_CHARSET || "utf8mb4").trim(),
                            connectionLimit: parseInt(process.env.DB_READ_CONNECTION || "8") || 8,
                            waitForConnections: true
                        };
                        writeConfig = {
                            host: (process.env.DB_WRITE_HOST || "").trim(),
                            port: parseInt(process.env.DB_WRITE_PORT || "3306") || 3306,
                            user: (process.env.DB_WRITE_USER || "").trim(),
                            password: process.env.DB_WRITE_PASSWORD || "",
                            database: (process.env.DB_WRITE_DATABASE || "").trim(),
                            charset: (process.env.DB_WRITE_CHARSET || "utf8mb4").trim(),
                            connectionLimit: parseInt(process.env.DB_WRITE_CONNECTION || "4") || 4,
                            waitForConnections: true
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(readConfig.user.length > 0)) return [3 /*break*/, 3];
                        this.readPool = (0, promise_1.createPool)(readConfig);
                        return [4 /*yield*/, this.readPool.getConnection()];
                    case 2:
                        connection = _a.sent();
                        connection.release();
                        _a.label = 3;
                    case 3:
                        ;
                        if (!(writeConfig.user.length > 0)) return [3 /*break*/, 5];
                        this.writePool = (0, promise_1.createPool)(writeConfig);
                        return [4 /*yield*/, this.writePool.getConnection()];
                    case 4:
                        connection = _a.sent();
                        connection.release();
                        _a.label = 5;
                    case 5:
                        ;
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        console.error("MySQL initialization failed:", err_1);
                        throw err_1;
                    case 7:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MySQLPool.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!this.readPool) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.readPool.end()];
                    case 1:
                        _a.sent();
                        this.readPool = null;
                        _a.label = 2;
                    case 2:
                        ;
                        if (!this.writePool) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.writePool.end()];
                    case 3:
                        _a.sent();
                        this.writePool = null;
                        _a.label = 4;
                    case 4:
                        ;
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _a.sent();
                        console.error("Failed to close MySQL connections:", err_2);
                        throw err_2;
                    case 6:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    MySQLPool.reset = function () {
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
    ;
    MySQLPool.table = function (tableName, target) {
        if (target === void 0) { target = "read"; }
        this.reset();
        this.tableName = tableName;
        this.currentTarget = target;
        return this;
    };
    ;
    MySQLPool.total = function () {
        this.withTotal = true;
        return this;
    };
    ;
    MySQLPool.select = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        if (fields.length > 0) {
            this.selectAry = fields;
        }
        ;
        return this;
    };
    ;
    MySQLPool.innerJoin = function (table, first, operator, second) {
        return this.join("INNER", table, first, operator, second);
    };
    ;
    MySQLPool.leftJoin = function (table, first, operator, second) {
        return this.join("LEFT", table, first, operator, second);
    };
    ;
    MySQLPool.rightJoin = function (table, first, operator, second) {
        return this.join("RIGHT", table, first, operator, second);
    };
    ;
    MySQLPool.join = function (type, table, first, operator, second) {
        if (second === undefined) {
            second = operator;
            operator = "=";
        }
        ;
        first = !first.includes(".") ? "`".concat(first, "`") : first;
        second = !second.includes(".") ? "`".concat(second, "`") : second;
        this.joinAry.push("".concat(type, " JOIN `").concat(table, "` ON ").concat(first, " ").concat(operator, " ").concat(second));
        return this;
    };
    ;
    MySQLPool.where = function (column, operator, value) {
        if (operator === "LIKE" && typeof value === "string") {
            value = "%".concat(value, "%");
        }
        else if (operator === "IN" && Array.isArray(value)) {
            value = value.map(function (v) { return v.toString(); });
        }
        else if (value == null) {
            value = operator;
            operator = "=";
        }
        ;
        column = !column.includes('(') && !column.includes(".") ? "`".concat(column, "`") : column;
        this.whereAry.push("".concat(column, " ").concat(operator, " ").concat(operator === "IN" ? "(?)" : "?"));
        this.bindingAry.push(value);
        return this;
    };
    ;
    MySQLPool.orderBy = function (column, direction) {
        if (direction === void 0) { direction = "ASC"; }
        direction = direction.toUpperCase();
        if ({
            ASC: 1,
            DESC: 1,
            asc: 1,
            desc: 1
        }[direction] == null) {
            console.error("Invalid order direction:", direction);
            return this;
        }
        ;
        column = !column.includes(".") ? "`".concat(column, "`") : column;
        this.orderAry.push("".concat(column, " ").concat(direction));
        return this;
    };
    ;
    MySQLPool.limit = function (num) {
        this.queryLimit = num;
        return this;
    };
    ;
    MySQLPool.offset = function (num) {
        this.queryOffset = num;
        return this;
    };
    ;
    MySQLPool.increase = function (target, number) {
        this.setAry.push("".concat(target, " = ").concat(target, " + ").concat(number || 1));
        return this;
    };
    ;
    MySQLPool.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fieldName, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.tableName === null) {
                            throw new Error("Table not set, query aborted.");
                        }
                        ;
                        fieldName = this.selectAry.map(function (field) {
                            field === "*" ? "*" : (!field.includes(".") ? "`".concat(field, "`") : field);
                            switch (true) {
                                case field === "*": return "*";
                                case /[\.\(\)]+/.test(field): return field;
                                default: return "`".concat(field, "`");
                            }
                            ;
                        }).join(", ");
                        query = "SELECT ".concat(fieldName, " FROM `").concat(this.tableName, "`");
                        if (this.joinAry.length > 0) {
                            query += " " + this.joinAry.join(" ");
                        }
                        ;
                        if (this.whereAry.length > 0) {
                            query += " WHERE " + this.whereAry.join(" AND ");
                        }
                        ;
                        if (this.withTotal) {
                            query = "SELECT COUNT(*) OVER() AS total, data.* FROM (".concat(query, ") AS data");
                        }
                        ;
                        if (this.orderAry.length > 0) {
                            query += " ORDER BY " + this.orderAry.join(", ");
                        }
                        ;
                        if (this.queryLimit !== null) {
                            query += " LIMIT ".concat(this.queryLimit);
                        }
                        ;
                        if (this.queryOffset !== null) {
                            query += " OFFSET ".concat(this.queryOffset);
                        }
                        ;
                        return [4 /*yield*/, this.query(query, this.bindingAry)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ;
    MySQLPool.insert = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, values, placeholders, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.tableName === null) {
                            throw new Error("Table not set, insert aborted.");
                        }
                        ;
                        columns = Object.keys(data);
                        values = Object.values(data);
                        placeholders = Array(values.length).fill('?');
                        query = "INSERT INTO `".concat(this.tableName, "` (`").concat(columns.join("`, `"), "`) VALUES (").concat(placeholders.join(", "), ")");
                        return [4 /*yield*/, this.query(query, values, "write")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.insertId || null];
                }
            });
        });
    };
    ;
    MySQLPool.update = function () {
        return __awaiter(this, arguments, void 0, function (data) {
            var values, _i, _a, _b, column, value, query;
            if (data === void 0) { data = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.tableName === null) {
                            throw new Error("Table not set, update aborted.");
                        }
                        ;
                        values = [];
                        for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                            _b = _a[_i], column = _b[0], value = _b[1];
                            column = !column.includes(".") ? "`".concat(column, "`") : column;
                            if (typeof value === "string" && this.supportFunction.includes(value.toUpperCase())) {
                                this.setAry.push("".concat(column, " = ").concat(value));
                            }
                            else {
                                this.setAry.push("".concat(column, " = ?"));
                                values.push(value);
                            }
                            ;
                        }
                        ;
                        query = "UPDATE `".concat(this.tableName, "` SET ").concat(this.setAry.join(", "));
                        if (this.whereAry.length > 0) {
                            query += " WHERE " + this.whereAry.join(" AND ");
                        }
                        ;
                        return [4 /*yield*/, this.query(query, __spreadArray(__spreadArray([], values, true), this.bindingAry, true), "write")];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    ;
    MySQLPool.upsert = function (data, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, values, placeholders, updateValues, updateClause, updateParts, _i, _a, _b, column, value, query, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.tableName === null) {
                            throw new Error("Table not set, upsert aborted.");
                        }
                        ;
                        columns = Object.keys(data);
                        values = Object.values(data);
                        placeholders = Array(values.length).fill('?');
                        updateValues = [];
                        updateClause = "";
                        if (typeof updateData === "string") {
                            updateClause = " ON DUPLICATE KEY UPDATE ".concat(updateData);
                        }
                        else if (updateData && typeof updateData === "object") {
                            updateParts = [];
                            for (_i = 0, _a = Object.entries(updateData); _i < _a.length; _i++) {
                                _b = _a[_i], column = _b[0], value = _b[1];
                                column = !column.includes(".") ? "`".concat(column, "`") : column;
                                if (typeof value === "string" && this.supportFunction.includes(value.toUpperCase())) {
                                    updateParts.push("".concat(column, " = ").concat(value));
                                }
                                else {
                                    updateParts.push("".concat(column, " = ?"));
                                    updateValues.push(value);
                                }
                            }
                            updateClause = " ON DUPLICATE KEY UPDATE ".concat(updateParts.join(", "));
                        }
                        else {
                            updateClause = " ON DUPLICATE KEY UPDATE " +
                                columns.map(function (col) {
                                    var column = !col.includes(".") ? "`".concat(col, "`") : col;
                                    return "".concat(column, " = VALUES(").concat(column, ")");
                                }).join(", ");
                        }
                        ;
                        query = "INSERT INTO `".concat(this.tableName, "` (`").concat(columns.join("`, `"), "`) VALUES (").concat(placeholders.join(", "), ")").concat(updateClause);
                        return [4 /*yield*/, this.query(query, __spreadArray(__spreadArray([], values, true), updateValues, true), "write")];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, result.insertId || null];
                }
            });
        });
    };
    MySQLPool.query = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, params, target) {
            var useTarget, pool, startTime, connection, results, endTime, duration, error_1;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        useTarget = target || this.currentTarget;
                        pool = useTarget === "write" ? this.writePool : this.readPool;
                        if (!pool) {
                            throw new Error("".concat(useTarget, " connection is not available."));
                        }
                        ;
                        startTime = Date.now();
                        connection = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, pool.getConnection()];
                    case 2:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.query(query, params)];
                    case 3:
                        results = (_a.sent())[0];
                        endTime = Date.now();
                        duration = endTime - startTime;
                        if (duration > 20) {
                            console.log("[Slow Query: ".concat(duration, "ms] [").concat(query, "]"));
                        }
                        ;
                        return [2 /*return*/, results];
                    case 4:
                        error_1 = _a.sent();
                        throw error_1;
                    case 5:
                        if (connection)
                            connection.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ;
    MySQLPool.read = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                if (!this.readPool) {
                    throw new Error("Read pool connection is not available.");
                }
                ;
                return [2 /*return*/, this.query(query, params, "read")];
            });
        });
    };
    ;
    MySQLPool.write = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, params) {
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                if (!this.writePool) {
                    throw new Error("Write pool connection is not available.");
                }
                ;
                return [2 /*return*/, this.query(query, params, "write")];
            });
        });
    };
    ;
    MySQLPool.readPool = null;
    MySQLPool.writePool = null;
    MySQLPool.tableName = null;
    MySQLPool.selectAry = ["*"];
    MySQLPool.joinAry = [];
    MySQLPool.whereAry = [];
    MySQLPool.bindingAry = [];
    MySQLPool.orderAry = [];
    MySQLPool.setAry = [];
    MySQLPool.queryLimit = null;
    MySQLPool.queryOffset = null;
    MySQLPool.withTotal = false;
    MySQLPool.currentTarget = "read";
    MySQLPool.supportFunction = [
        "NOW()", "CURRENT_TIMESTAMP", "UUID()", "RAND()", "CURDATE()",
        "CURTIME()", "UNIX_TIMESTAMP()", "UTC_TIMESTAMP()", "SYSDATE()",
        "LOCALTIME()", "LOCALTIMESTAMP()", "PI()", "DATABASE()", "USER()",
        "VERSION()"
    ];
    return MySQLPool;
}());
process.on("SIGINT", function (_) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, MySQLPool.close()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
process.on("SIGTERM", function (_) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, MySQLPool.close()];
            case 1:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); });
exports.default = MySQLPool;
