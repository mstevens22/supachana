/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
const express = require('express');

const app = express();

let google = require('googleapis');
let config = require("./config.json");
let privatekey = require("./supanacha-2-a45bf07275b1.json");

//Todo: imagine a setup through localized json files (ga:id, cron frequency, locale, etc..) 

// configure a JWT auth client
let jwtClient = new google.auth.JWT(
       privatekey.client_email,
       null,
       privatekey.private_key,
       ['https://www.googleapis.com/auth/analytics',
       'https://www.googleapis.com/auth/analytics.readonly']);

//authenticate request
jwtClient.authorize(function (err, tokens) {
 if (err) {
   console.log(err);
   return;
 } else {
   console.log("Successfully connected! to google apis");
 }
});

var analytics = google.analytics('v3');

const clientTwilio = require('twilio')(
  config.twilio_sid,
  config.twilio_token
);

app.get('/', (req, res) => {	
	if(req.headers[config.expected_header]){//Only cronjob can access
		analytics.data.realtime.get({
	        auth: jwtClient,
	        'ids': config.ga_view_id,
	        'metrics': config.ga_metrics,
	        'dimensions': 'rt:minutesAgo',
	        'prettyPrint': true
    	}, function(err, result) {    			
	        if (result) {
	        	var success = false;	        	
	        	//Find index of relevant dimension
	        	if(typeof result.rows !== 'undefined'){
		        	//delayIndex = result.findIndex(element => element.name == "rt:minutesAgo");
		        	for (var ind in result.columnHeaders) {
					  if (result.columnHeaders[ind].name == "rt:minutesAgo") {
		        			var delayIndex = ind;
		        			break;
		        		}
					}
		        	//Loop over result to get at least one occured since delay
		        	for (let item of result.rows) {	        		
		        		if (item[delayIndex] < config.delay) {
		        			success = true;
		        			break;
		        		}				  
					}
				}
				//If no occurence then send notification
				if (!success || typeof result.rows === 'undefined') {
			        clientTwilio.messages.create({
					  from: config.twilio_from,
					  to: config.twilio_to,
					  body: JSON.stringify(result)
					}).then((messsage) => console.log(message.sid));
	        	}
	        }	           
    	});
		res.status(200).send('====SUPACHANA===$').end();
	} else {
		res.status(401).send('====SUPACHANA===$').end();
	}
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
