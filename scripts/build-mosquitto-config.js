import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const requiredKeys = [
  "LOCAL_MQTT_PORT",
  "AWS_IOT_ENDPOINT",
  "AWS_IOT_PORT",
  "AWS_ROOT_CA_PATH",
  "AWS_CERT_PATH",
  "AWS_PRIVATE_KEY_PATH",
  "MOSQUITTO_PASSWORD_FILE_PATH",
  "MOSQUITTO_OUTPUT_CONF_PATH",
  "MOSQUITTO_BRIDGE_NAME"
];

function readEnv(key) {
  return (process.env[key] ?? "").trim();
}

function normalizePathForMosquitto(filePath) {
  return filePath.replaceAll("\\", "/");
}

const missingKeys = requiredKeys.filter((key) => readEnv(key).length === 0);
if (missingKeys.length > 0) {
  console.error("missing .env keys:", missingKeys.join(", "));
  process.exit(1);
}

const templatePath = path.resolve("config/mosquitto.bridge.conf.template");
if (!fs.existsSync(templatePath)) {
  console.error(`template file not found: ${templatePath}`);
  process.exit(1);
}

const values = {
  LOCAL_MQTT_PORT: readEnv("LOCAL_MQTT_PORT"),
  AWS_IOT_ENDPOINT: readEnv("AWS_IOT_ENDPOINT"),
  AWS_IOT_PORT: readEnv("AWS_IOT_PORT"),
  AWS_ROOT_CA_PATH: normalizePathForMosquitto(readEnv("AWS_ROOT_CA_PATH")),
  AWS_CERT_PATH: normalizePathForMosquitto(readEnv("AWS_CERT_PATH")),
  AWS_PRIVATE_KEY_PATH: normalizePathForMosquitto(readEnv("AWS_PRIVATE_KEY_PATH")),
  MOSQUITTO_PASSWORD_FILE_PATH: normalizePathForMosquitto(readEnv("MOSQUITTO_PASSWORD_FILE_PATH")),
  MOSQUITTO_BRIDGE_NAME: readEnv("MOSQUITTO_BRIDGE_NAME")
};

let outputText = fs.readFileSync(templatePath, "utf8");

for (const [key, value] of Object.entries(values)) {
  outputText = outputText.split(`{{${key}}}`).join(value);
}

const unresolvedTokens = outputText.match(/\{\{[^}]+\}\}/g);
if (unresolvedTokens && unresolvedTokens.length > 0) {
  console.error("some template keys were not replaced:", unresolvedTokens.join(", "));
  process.exit(1);
}

const outputPath = path.resolve(readEnv("MOSQUITTO_OUTPUT_CONF_PATH"));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, outputText, "utf8");

console.log("mosquitto bridge config generated:");
console.log(outputPath);