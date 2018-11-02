const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const httpSignature = require('http-signature');
const prettyJson = require('prettyjson');
const colorType = require('./constants/colors');
const commands = require('./lib/commands');
const stConfig = require('./lib/config');
const scheduling = require('./lib/scheduling');
const airCondition = require('./lib/air');
const file = require('./lib/file');
const slack = require('./lib/slack');
const subscription = require('./lib/subscription');
const publicKey = fs.readFileSync('./config/smartthings_rsa.pub', 'utf8');
const stApi = require('./lib/appConfig').smartThingsApi;
const prettyjsonOptions = {};
const app = express();

app.use(bodyParser.json());

app.post('/', function (req, response) {
	
	file.createFile();
	
	if (req.body && req.body.lifecycle === 'PING' || signatureIsVerified(req)) {
		handleRequest(req, response);
	} else {
		response.status(401).send('Forbidden');
	}
});


function signatureIsVerified(req) {
	try {
		let parsed = httpSignature.parseRequest(req);
		if (!httpSignature.verifySignature(parsed, publicKey)) {
			console.log('forbidden - failed verifySignature');
			return false;
		}
	} catch (error) {
		console.error(error);
		return false;
	}
	return true;
}

function handleRequest(req, response) {
	let evt = req.body;
	let lifecycle = evt.lifecycle;
	let res;
	
	switch (lifecycle) {
		
		case 'PING': {
			console.log('PING');
			let chal = evt.pingData.challenge;
			response.json({statusCode: 200, pingData: {challenge: chal}});
			break;
		}
		
		case 'CONFIGURATION': {
			console.log('CONFIGURATION');
			res = stConfig.handle(evt.configurationData);
			response.json({statusCode: 200, configurationData: res});
			break;
		}
		
		case 'INSTALL': {
			console.log('INSTALL');
			let token = evt.installData.authToken;
			setBulbColor(evt.installData.installedApp, token);
			createSchedule(evt.installData.installedApp, token);
			subscription.createSubscription(evt.installData.installedApp, token);
			response.json({statusCode: 200, installData: {}});
			break;
		}
		
		case 'UPDATE': {
			console.log('UPDATE');
			let token = evt.updateData.authToken;
			setBulbColor(evt.updateData.installedApp, token);
			response.json({statusCode: 200, updateData: {}});
			break;
		}
		
		case 'UNINSTALL': {
			console.log('UNINSTALL');
			let token = evt.uninstalledApp.authToken;
			subscription.deleteSubscription(evt.uninstallData.installedApp, token);
			response.json({statusCode: 200, uninstallData: {}});
			break;
		}
		
		case 'EVENT': {
			console.log('EVENT');
			handleEvent(evt.eventData);
			response.json({statusCode: 200, eventData: {}});
			break;
		}
		
		default: {
			console.log(`Lifecycle ${lifecycle} not supported`);
		}
	}
}

function handleEvent(eventData) {
	
	const eventType = eventData.events[0].eventType;
	const token = eventData.authToken;
	
	if ('TIMER_EVENT' === eventType) {
		console.log('TIMER_EVENT');
		setBulbColor(eventData.installedApp, token);
	} else if ('DEVICE_EVENT' === eventType) {
		console.log('DEVICE_EVENT');
		let deviceEvent = eventData.events[0].deviceEvent;
		console.log(deviceEvent);
		handleDeviceEvent(deviceEvent, eventData.installedApp)
	} else {
		console.error(`Got ${eventType}`)
	}
}

function handleDeviceEvent(deviceEvent, installedApp) {
	
	console.log('handleDeviceEvent: ' + deviceEvent);
	
	if (deviceEvent.value === 'open') {
		
		const city = installedApp.config.city[0].stringConfig.value;
		const selectedCity = airCondition.getGeoCoordinates(city);
		
		airCondition.getAirConditionsInfo(selectedCity)
			.then(function (airState) {
				
				let color = airCondition.getColorForAirCondition(airState);
				if (color === colorType.RED) {
					console.log('Sending message to slack');
					const message = slack.createMessage(airState);
					slack.sendMessage(message);
				}
			});
	}
}

function setBulbColor(installedApp, token) {
	
	const city = installedApp.config.city[0].stringConfig.value;
	const deviceIdBulb = installedApp.config.colorLight[0].deviceConfig.deviceId;
	const deviceIdSiren = installedApp.config.siren[0].deviceConfig.deviceId;
	const deviceIdFan = installedApp.config.fan[0].deviceConfig.deviceId;
	const selectedCity = airCondition.getGeoCoordinates(city);
	
	console.log('Selected city is: ' + city);
	
	airCondition.getAirConditionsInfo(selectedCity)
		.then(function (airState) {
			
			let color = airCondition.getColorForAirCondition(airState);
			commands.actuate(deviceIdBulb, token, [
				{
					command: 'on',
					capability: 'switch',
					component: 'main',
					arguments: []
				},
				{
					command: 'setLevel',
					capability: 'switchLevel',
					component: 'main',
					arguments: [20]
				},
				{
					command: 'setColor',
					capability: 'colorControl',
					component: 'main',
					arguments: [color]
				}
			]);
			
			
			airState = JSON.parse(airState);
			const airConditionForFile = airState['breezometer_description'];
			file.openFileAndAppendData(airConditionForFile)
			
			if (color === colorType.RED) {
				console.log('Turn the siren and the outlet on');
				commands.actuate(deviceIdSiren, token, [
					{
						command: 'on',
						capability: 'switch',
						component: 'main',
						arguments: []
					}
				]);
				
				commands.actuate(deviceIdFan, token, [
					{
						command: 'on',
						capability: 'switch',
						component: 'main',
						arguments: []
					}
				]);
			}
		})
		.then(function () {
			console.log('successfully sent device commands');
		})
		.catch(function (cmdErr) {
			console.error('Error executing command');
			console.error(prettyJson.render(cmdErr, prettyjsonOptions));
		})
		.catch(function (airConditionError) {
			console.error('Error getting current air conditions:');
			console.error(prettyJson.render(airConditionError, prettyjsonOptions));
		});
}


function createSchedule(installedApp, token) {
	
	const scheduleSetting = installedApp.config.scheduleInterval[0].stringConfig.value;
	const scheduleInterval = stConfig.getScheduleInterval(scheduleSetting);
	
	scheduling.deleteSchedules(installedApp.installedAppId, stApi, token)
		.then(function (resp) {
			scheduling.createCron(`0/${scheduleInterval} * * * ? *`, 'UTC', installedApp.installedAppId, stApi, token)
				.then(function (resp) {
					console.log('Successfully created schedule:');
					console.log(prettyJson.render(resp, prettyjsonOptions));
				}).catch(function (createScheduleErr) {
				console.log('Error creating schedule:');
				console.log(prettyJson.render(createScheduleErr, prettyjsonOptions));
			})
		})
		.catch(function (deleteScheduleErr) {
			console.log('Error creating schedule:');
			console.log(prettyJson.render(deleteScheduleErr, prettyjsonOptions));
		});
}


let server = app.listen(3005);

module.exports = server;
console.log('Open: http://127.0.0.1:3005');