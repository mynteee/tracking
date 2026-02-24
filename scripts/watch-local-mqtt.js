import dotenv from "dotenv";
import mqtt from "mqtt";

dotenv.config();

const host = (process.env.LOCAL_MQTT_HOST ?? "127.0.0.1").trim();
const port = Number.parseInt((process.env.LOCAL_MQTT_PORT ?? "1883").trim(), 10);
const username = (process.env.LOCAL_MQTT_USERNAME ?? "").trim();
const password = (process.env.LOCAL_MQTT_PASSWORD ?? "").trim();
const topic = (process.env.LOCAL_MQTT_TOPIC ?? "espresense/devices/#").trim();

const brokerUrl = `mqtt://${host}:${port}`;

console.log(`connecting to local broker: ${brokerUrl}`);

const client = mqtt.connect(brokerUrl, {
  username,
  password,
  reconnectPeriod: 2000
});

client.on("connect", () => {
  console.log("connected. subscribing now...");
  client.subscribe(topic, { qos: 0 }, (error) => {
    if (error) {
      console.error("subscribe failed:", error.message);
      return;
    }

    console.log(`watching topic: ${topic}`);
    console.log("press ctrl+c to stop\n");
  });
});

client.on("message", (receivedTopic, payloadBuffer) => {
  const rawPayload = payloadBuffer.toString("utf8");
  const time = new Date().toISOString();

  let parsedPayload = null;
  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch {
    parsedPayload = null;
  }

  console.log(`[${time}] topic: ${receivedTopic}`);
  if (parsedPayload) {
    console.log(JSON.stringify(parsedPayload, null, 2));
  } else {
    console.log(rawPayload);
  }
  console.log("");
});

client.on("error", (error) => {
  console.error("mqtt error:", error.message);
});

process.on("SIGINT", () => {
  console.log("\nstopping watcher...");
  client.end(true, () => {
    process.exit(0);
  });
});