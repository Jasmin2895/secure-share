import express from 'express';
const path = require('path');
import request from 'request';
import { slack } from "../config/index"

import { log } from './utils';
const payloads = require('./payload');
const api = require("./api")
import { generateQRCode } from './module/qrCodes';

const router = new express.Router();
const debug = require('debug')('slash-command-template:index');

router.post('/slack/command/secure-share', async (req, res) => {
    try {
        const { trigger_id } = req.body;
        let view = payloads.modal({
            trigger_id
        });
        let result = await api.callAPIMethod('views.open', view);

        debug('views.open: %o', result);
        return res.send('');
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

router.post('/slack/actions', async (req, res) => {
    try {
        const slackReqObj = JSON.parse(req.body.payload);
        let response;
        let msgToEncode = slackReqObj.view.state.values["secure-share"]["secure-share-msg"].value
        let response_url = slackReqObj.response_urls[0].response_url
        let channel_id = slackReqObj.response_urls[0].channel_id

        if (slackReqObj.type === "view_submission") {
            response = await generateQRCode({ msgToEncode, response_url, channel_id })
        }
        return res.send();
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

router.get('/', async (req, res) => {
    console.log("req", req.query)
    res.sendFile(path.join(__dirname + '/index.html'));
});

router.get('/auth/redirect', (req, res) => {
    console.log("auth redirect req.query.code", req.query.code)
    var options = {
        uri: 'https://slack.com/api/oauth.access?code='
            + req.query.code +
            '&client_id=' + slack.reporterBot.clientId +
            '&client_secret=' + slack.reporterBot.clientSecret +
            '&redirect_uri=' + slack.reporterBot.redirectURI,
        method: 'GET'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok) {
            console.log(JSONresponse)
            res.send("Error encountered: \n" + JSON.stringify(JSONresponse)).status(200).end()
        } else {
            console.log(JSONresponse)
            res.send("Success!")
        }
    })
})
export default router;
