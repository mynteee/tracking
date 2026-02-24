import dotenv from "dotenv";
import mqtt from "mqtt";

dotenv.config();

const host = (process.env.LOCAL_MQTT_HOST ?? "127.0.0.1").trim();
const port = Number.parseInt((process.env.LOCAL_MQTT_PORT ?? "1883").trim(), 10);
const username = (process.env.LOCAL_MQTT_USERNAME ?? "").trim();
const password = (process.env.LOCAL_MQTT_PASSWORD ?? "").trim();
const room = (process.env.ESPRESENSE_ROOM ?? "office").trim();
const scannerId = (process.env.ESPRESENSE_SCANNER_ID ?? "esp32_office").trim();
const bleMac = (process.env.SAMPLE_BLE_MAC ?? "AA:BB:CC:DD:EE:FF").trim();

const customTopic = (process.argv[2] ?? "").trim();
const topic = customTopic || `espresense/devices/${bleMac}/${room}`;

const payload = {
  id: bleMac,
  room,
  scanner_id: scannerId,
  rssi: -62,
  distance: 2.1,
  confidence: 0.91,
  speed: 0,
  seen: new Date().toISOString(),
  note: "sample payload from local script"
};

const brokerUrl = `mqtt://${host}:${port}`;
const client = mqtt.connect(brokerUrl, { username, password });

client.on("connect", () => {
  const body = JSON.stringify(payload);

  client.publish(topic, body, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error("publish failed:", error.message);
      client.end(true, () => process.exit(1));
      return;
    }

    console.log("sample message sent");
    console.log(`topic: ${topic}`);
    console.log(body);

    client.end(true, () => process.exit(0));
  });
});

client.on("error", (error) => {
  console.error("mqtt error:", error.message);
  client.end(true, () => process.exit(1));
});