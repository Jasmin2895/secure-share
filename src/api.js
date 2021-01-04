import config from 'config';
import { slack } from "../config/index"
const axios = require('axios');
const qs = require('querystring');
const slackConfig = config.get('slack');
const apiUrl = 'https://slack.com/api';

const callAPIMethod = async (method, payload, token) => {
    console.log("callAPIMethod", method, payload, token)
    let data = Object.assign({ token }, payload);
    let result = await axios.post(`${apiUrl}/${method}`, qs.stringify(data));
    return result.data;
}

module.exports = {
    callAPIMethod
}