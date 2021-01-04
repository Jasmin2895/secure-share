import express from 'express';
import request from 'request';
import { slack } from "../config/index"
const path = require('path');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

import { log, saveToDB, getValueFromDB } from './utils';
const payloads = require('./payload');
const api = require("./api")
import { generateQRCode } from './module/qrCodes';

const router = new express.Router();
const debug = require('debug')('slash-command-template:index');

router.post('/slack/command/secure-share', async (req, res) => {
    try {
        const { trigger_id, team_id } = req.body;
        console.log("request body", req.body, team_id)
        let botUser = getValueFromDB(team_id)
        let view = payloads.modal({
            trigger_id
        });
        let result = await api.callAPIMethod('views.open', view, botUser.token);

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
        let teamId = slackReqObj.team.id;
        let msgToEncode = slackReqObj.view.state.values["secure-share"]["secure-share-msg"].value
        let response_url = slackReqObj.response_urls[0].response_url
        let channel_id = slackReqObj.response_urls[0].channel_id

        if (slackReqObj.type === "view_submission") {
            response = await generateQRCode({ msgToEncode, response_url, channel_id, teamId })
        }
        return res.send();
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

router.get('/', async (req, res) => {
    console.log("req", req.query)
    db.get('posts')
        .push({ id: 1, name: 'lowdb is awesome', token: "" })
        .write()

    let testReadVal = db.get('workspaces').find({ id: 1 }).value()
    console.log("testReadVal", testReadVal)
    res.sendFile(path.join(__dirname + '/index.html'));
});

router.get('/auth/redirect', (req, res) => {
    console.log("auth redirect req.query.code", req.query.code)
    var options = {
        uri: 'https://slack.com/api/oauth.v2.access?code='
            + req.query.code +
            '&client_id=' + slack.reporterBot.clientId +
            '&client_secret=' + slack.reporterBot.clientSecret +
            '&redirect_uri=' + slack.reporterBot.redirectURI,
        method: 'GET'
    }
    request(options, async (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok) {
            console.log(JSONresponse)
            res.send("Error encountered: \n" + JSON.stringify(JSONresponse)).status(200).end()
        } else {
            console.log("App is successfully added to your workspace!", JSONresponse)
            await saveToDB({ id: JSONresponse.team.id, name: JSONresponse.team.name, token: JSONresponse.access_token })
            res.send("Success, App is added to your workspace!")
        }
    })
})
export default router;
