# espresense to aws iot bridge (simple and explicit)

this repo is a practical setup for:

1. esp32 running espresense firmware
2. local mosquitto broker
3. mosquitto bridge to aws iot core over tls
4. clear debug scripts so you can see each step working

nothing here is hidden behind frameworks. every script is short and readable.

## repo layout

- `config/.env.example`: all values you edit
- `config/mosquitto.bridge.conf.template`: plain mosquitto bridge template
- `scripts/check-config.js`: checks your env values and file paths
- `scripts/build-mosquitto-config.js`: generates final mosquitto bridge config
- `scripts/watch-local-mqtt.js`: watches local espresense mqtt traffic
- `scripts/send-sample-message.js`: sends a fake espresense message for testing
- `docs/setup.md`: full setup from zero
- `docs/troubleshooting.md`: common issues and quick fixes

## quick start

```powershell
npm install
copy-item config/.env.example .env
# edit .env with your real values
npm run check
npm run build:mosquitto
```

after that, follow [setup guide](docs/setup.md).

## notes

- this repo does not flash firmware for you. you do that from the espresense web installer.
- this repo does not manage aws resources automatically. the guide walks you through console setup so you can see every piece.
- keep your cert files private and never commit `.env`.
