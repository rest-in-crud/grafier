"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../../.env') });
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: './src/database/schema/**/*.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URI,
        ssl: true,
    },
});
//# sourceMappingURL=drizzle.config.js.map