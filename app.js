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
let privatekey = require("./supanacha-2-a45bf07275b1.json");

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
   console.log("Successfully connected!");
 }
});

var analytics = google.analytics('v3');

app.get('/', (req, res) => {
	console.log(req.headers);
	if(req.headers['x-appengine-cron']){
		analytics.data.realtime.get({
        auth: jwtClient,
        'ids': 'ga:115201053',
        //'metrics': 'rt:goal1Completions',
        'metrics': 'rt:pageviews',
        'dimensions': 'rt:minutesAgo',
        'prettyPrint': true
    }, function(err, result) {
        console.log(err);
        if (result) {
        	for(var i = 0; i < result.rows.length;i++){
		        console.log(result.rows[i]);
		  	}
        }        
    });
		res.status(200).send('====SUPACHANA===$').end();
	}
  res.status(401).send('====SUPACHANA===$').end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
