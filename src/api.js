const axios = require('axios');
const qs = require('querystring');
const apiUrl = 'https://slack.com/api';

const callAPIMethod = async (method, payload) => {
    let data = Object.assign({}, payload);
    let result = await axios.post(`${apiUrl}/${method}`, qs.stringify(data));
    return result.data;
}

module.exports = {
    callAPIMethod
}