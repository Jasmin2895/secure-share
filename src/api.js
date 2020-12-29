import config from 'config';
const axios = require('axios');
const qs = require('querystring');
const slackConfig = config.get('slack');
const apiUrl = 'https://slack.com/api';

const callAPIMethod = async (method, payload) => {
    let data = Object.assign({ token: slackConfig.reporterBot.botToken }, payload);
    let result = await axios.post(`${apiUrl}/${method}`, qs.stringify(data));
    return result.data;
}

module.exports = {
    callAPIMethod
}