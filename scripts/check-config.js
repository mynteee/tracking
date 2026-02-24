import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const requiredKeys = [
  "LOCAL_MQTT_HOST",
  "LOCAL_MQTT_PORT",
  "LOCAL_MQTT_USERNAME",
  "LOCAL_MQTT_PASSWORD",
  "AWS_IOT_ENDPOINT",
  "AWS_IOT_PORT",
  "AWS_ROOT_CA_PATH",
  "AWS_CERT_PATH",
  "AWS_PRIVATE_KEY_PATH",
  "MOSQUITTO_PASSWORD_FILE_PATH",
  "MOSQUITTO_OUTPUT_CONF_PATH",
  "MOSQUITTO_BRIDGE_NAME"
];

const filePathKeys = [
  "AWS_ROOT_CA_PATH",
  "AWS_CERT_PATH",
  "AWS_PRIVATE_KEY_PATH",
  "MOSQUITTO_PASSWORD_FILE_PATH"
];

let hasIssue = false;

function readEnv(key) {
  return (process.env[key] ?? "").trim();
}

function printResult(ok, label, detail = "") {
  const status = ok ? "ok" : "issue";
  const suffix = detail ? ` -> ${detail}` : "";
  console.log(`${status.padEnd(5)} ${label}${suffix}`);
  if (!ok) {
    hasIssue = true;
  }
}

function checkPort(key) {
  const raw = readEnv(key);
  const value = Number.parseInt(raw, 10);
  const valid = Number.isInteger(value) && value > 0 && value <= 65535;
  printResult(valid, `${key} is a valid port`, raw || "missing");
}

console.log("checking your .env values now\n");

for (const key of requiredKeys) {
  const value = readEnv(key);
  printResult(value.length > 0, `${key} exists`, value.length > 0 ? "set" : "missing");
}

console.log("");
checkPort("LOCAL_MQTT_PORT");
checkPort("AWS_IOT_PORT");

console.log("\nchecking required files\n");

for (const key of filePathKeys) {
  const rawPath = readEnv(key);
  if (!rawPath) {
    printResult(false, `${key} file exists`, "missing path");
    continue;
  }

  const resolvedPath = path.resolve(rawPath);
  printResult(fs.existsSync(resolvedPath), `${key} file exists`, resolvedPath);
}

console.log("\nchecking template and output folder\n");

const templatePath = path.resolve("config/mosquitto.bridge.conf.template");
printResult(fs.existsSync(templatePath), "template file exists", templatePath);

const outputPath = readEnv("MOSQUITTO_OUTPUT_CONF_PATH");
if (outputPath) {
  const outputFolder = path.dirname(path.resolve(outputPath));
  printResult(fs.existsSync(outputFolder), "output folder exists", outputFolder);
}

if (hasIssue) {
  console.log("\nthere are issues above. fix them and run npm run check again.");
  process.exit(1);
}

console.log("\nall good. your config looks ready.");