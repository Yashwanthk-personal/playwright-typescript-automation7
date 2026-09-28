import dotenv from "dotenv";
import path from "path";
import { UserConfig } from "./user";
import { UI_CONSTANTS, API_CONSTANTS } from "./constants";

const env = process.env.TEST_ENV || 'dev';

dotenv.config({
  path: path.resolve(__dirname, `../.env.${env}`)
});

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value || defaultValue || '';
}

export const APP_BASE_URL = getEnv("DEMOWEBSHOP_BASE_URL");
export const API_BASE_URL = getEnv("API_BASE_URL", "http://localhost:3000");

export const LOGIN_PATH = "/auth/login" as const;

export { UserConfig };
export { UI_CONSTANTS, API_CONSTANTS };
