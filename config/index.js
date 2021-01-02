const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    slack: {
        fileUploadUrl: "https://slack.com/api/files.upload",
        fileDeleteUrl: "https://slack.com/api/files.delete",
        reporterBot: {
            botToken: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET
        }
    }
}