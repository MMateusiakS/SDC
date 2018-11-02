# SmartThings SmartApp

This sample WebHook SmartApp demonstrates the use of the new SmartThings API for Automation.

This WebHook SmartApp showcases:

- App installation and configuration flow.
- HTTP Signature verification to ensure that the incoming requests are from SmartThings.
- Integrating with a third-party API (Air quality API in this case).
- Actuating devices using the SmartThings API.
- Creating schedules and handling scheduled executions.

## Setup instructions


### Prerequisites

- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm  and Node).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel to create a globally available URL for fast testing.
- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A SmartThings-compatible color bulb, such as SYLVANIA Smart RGBW or LIFX, or Phillips Hue.
- Make sure you open an account (it is free) on [Developer Workspace](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/home).

### Steps

1. Access the code.

2. Create an API key in https://breezometer.com/air-quality-api/. Create account on Slack and create app on Slack. Follow: https://api.slack.com/incoming-webhooks.

3. Install the dependencies for this app: `npm install`.

4. Start the server: `npm start`.

5. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.

6. Go to the [Automation](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/development/automation) section of the Developer Workspace and create an Automation.
	- For the **SmartApp Type** select **WebHook endpoint** and enter the https URL you copied from the above step.
	- For the **Scope**, click on **Settings** and select all.
	- Click **SAVE AND NEXT**.
	- In the next screen you will be presented with the **Public Key**.

7. Copy this public key and replace the contents of the file `config/smartthings_rsa.pub` with it.

8. Click **CONFIRM** to register your automation in self-publishing mode.

9. Stop the npm server: `CTRL-C`.

10. Start the server again: `npm start` (this ensures that the public key will be used to verify requests from SmartThings).

11. Install the SmartApp in the SmartThings mobile app (go to Automation>Add automation)

12. Enter all required inputs on the configuration screens.

13. Once installed, the configured bulb will change color depends on the air quality (red - poor air quality, green - good air quality, blue - moderate air quality). If poor air quality will be in the selected city, siren will turn on, outlet will turn the fan on. If meantime someone opens the window, we will get notification on Slack about poor air quality and steps that should be done to protect health.

## Troubleshooting

- When you try to install the SmartApp in the SmartThings mobile app if you get an error **Something went wrong. Please try to install the SmartApp again**, then it is possible that you did not restart the npm server as specified in Step 10 above. If this is the case, then in the npm server terminal you will also see this error: `forbidden - failed verifySignature`. Make sure you restart the npm server by doing Step 10 above.

## Documentation

- Documentation for developing SmartApps can be found on the new [SmartThings developer portal](https://smartthings.developer.samsung.com/develop/guides/smartapps/basics.html).
- [SmartThings API reference documentation](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html)

