# troubleshooting

## no messages in aws but local watcher shows data

check these first:

1. aws endpoint is correct in `.env`
2. cert file paths are correct and files exist
3. policy is attached to the certificate
4. mosquitto is started with the generated bridge config
5. mosquitto logs show bridge connected to aws

## esp32 can not connect to mqtt broker

1. use your pc local ip, not `localhost`
2. check firewall rules for port `1883`
3. verify username/password match `mosquitto_passwd` file
4. make sure mosquitto is actually running

## check script says file missing

- update path in `.env`
- use full absolute paths
- on windows, forward slashes are easiest: `C:/path/to/file.pem`

## local watcher shows unreadable payload

that can happen if the payload is not json.

- verify topic is `espresense/devices/#`
- send a test json with `npm run send:sample`
- if sample json prints fine, watcher is okay

## bridge connects then disconnects

likely tls or cert issue:

1. wrong root ca file
2. wrong device cert/private key pair
3. policy missing action(s)
4. system clock is very wrong

check mosquitto logs in verbose mode (`-v`) and fix the first tls error.

## i changed .env but nothing changed in mosquitto

you need to regenerate config:

```powershell
npm run build:mosquitto
```

then restart mosquitto with that file.