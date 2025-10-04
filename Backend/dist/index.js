"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // load env first
const app_1 = __importDefault(require("./app"));
require("./cron/birthdayJob");
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
