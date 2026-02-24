# setup guide (windows first)

this is the full flow from zero to working messages in aws iot core.

## 1) what you need

- an aws account with access to iot core
- 1 esp32 board
- usb data cable
- wifi network (2.4ghz is usually easiest for esp32)
- any bluetooth device nearby (phone/watch/tag)
- node.js 20+ installed
- mosquitto installed locally

## 2) install mosquitto on windows

option a (winget):

```powershell
winget install EclipseMosquitto.Mosquitto
```

option b (manual):

1. download installer from `https://mosquitto.org/download/`
2. install to `c:\mosquitto`
3. make sure `c:\mosquitto` is in your `path`

check install:

```powershell
mosquitto -h
mosquitto_passwd -h
```

## 3) create aws iot thing + cert + policy

1. open aws console
2. go to `iot core`
3. go to `manage -> all devices -> things`
4. click `create thing`
5. choose `create single thing`
6. name it something like `esp32-espresense-bridge`
7. choose `auto-generate a new certificate`
8. download these files and keep them safe:
   - device certificate (`*.pem.crt`)
   - private key (`*-private.pem.key`)
   - public key (`*-public.pem.key`)
   - amazon root ca 1 (`AmazonRootCA1.pem`)
9. create a policy (demo policy):
   - action: `iot:Connect`
   - action: `iot:Publish`
   - action: `iot:Subscribe`
   - action: `iot:Receive`
   - resource: `*`
   - this wildcard is okay for a quick test, but tighten it before production
10. attach that policy to the certificate
11. copy your aws endpoint:
   - `iot core -> settings -> device data endpoint`
   - it usually looks like `xxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com`

## 4) set up this repo

from repo root:

```powershell
npm install
copy-item config/.env.example .env
```

open `.env` and fill all values:

- `LOCAL_MQTT_HOST`: your pc local ip (not localhost)
- `LOCAL_MQTT_PORT`: usually `1883`
- `LOCAL_MQTT_USERNAME` + `LOCAL_MQTT_PASSWORD`: your local broker login
- `AWS_IOT_ENDPOINT`: from aws iot settings
- `AWS_ROOT_CA_PATH`: full path to `AmazonRootCA1.pem`
- `AWS_CERT_PATH`: full path to cert file
- `AWS_PRIVATE_KEY_PATH`: full path to private key file
- `MOSQUITTO_PASSWORD_FILE_PATH`: where you want local password file
- `MOSQUITTO_OUTPUT_CONF_PATH`: where generated bridge config goes

tip: use forward slashes in windows paths to keep it simple.

## 5) create local mosquitto username/password

example command:

```powershell
mosquitto_passwd -c C:/mosquitto/config/passwords.txt username
```

enter password when prompted.

then set the same values in `.env`:

- `LOCAL_MQTT_USERNAME=username`
- `LOCAL_MQTT_PASSWORD=<the password you entered>`

## 6) validate config + generate bridge config

```powershell
npm run check
npm run build:mosquitto
```

this creates the bridge config file at `MOSQUITTO_OUTPUT_CONF_PATH`.

## 7) run mosquitto with generated config

```powershell
mosquitto -c C:/mosquitto/config/bridge-espresense.conf -v
```

if your output path is different, use that path instead.

leave this terminal running.

## 8) flash and configure espresense on esp32

1. plug esp32 into your pc
2. open `https://espresense.com/firmware`
3. click connect, pick your esp32 serial device
4. install firmware (erase + install)
5. set wifi ssid/password
6. open the device web page after it boots
7. mqtt settings:
   - server: your pc local ip (`LOCAL_MQTT_HOST`)
   - port: `1883`
   - username: `LOCAL_MQTT_USERNAME`
   - password: `LOCAL_MQTT_PASSWORD`
8. room name: whatever you want (`office`, `lab`, etc)
9. save and restart

## 9) verify locally and in aws

open terminal a:

```powershell
npm run watch:local
```

you should start seeing espresense messages on `espresense/devices/#`.

optional test without hardware:

```powershell
npm run send:sample
```

open aws console -> iot core -> mqtt test client:

1. subscribe to `espresense/devices/#`
2. you should see messages forwarded by the bridge

if not working, check [troubleshooting](troubleshooting.md).

## 10) useful windows commands

get your local ip:

```powershell
ipconfig
```

find `ipv4 address` for your active adapter.

test if port 1883 is open locally:

```powershell
test-netconnection -computername 127.0.0.1 -port 1883
```
