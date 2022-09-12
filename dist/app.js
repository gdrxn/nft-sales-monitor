"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const monitor_1 = __importDefault(require("./classes/monitor"));
const params = {
    MAINNET_API: process.env.MAINNET_API,
    ABI: [],
    contractAddress: "",
    WEBHOOK_URL: process.env.WEBHOOK_URI,
    collectionName: "", // name of the collection
};
const monitor1 = new monitor_1.default(params);
monitor1.start();
