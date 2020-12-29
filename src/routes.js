import express from 'express';

import { log } from './utils';
const payloads = require('./payloads');
const api = require("./api")
import { generateQRCode } from './modules/reports';

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

        if (slackReqObj.type === "view_submission") {
            response = await generateQRCode({ msgToEncode, response_url })
        }
        return res.send();
    } catch (err) {
        log.error(err);
        return res.status(500).send('Something blew up. We\'re looking into it.');
    }
});

export default router;
