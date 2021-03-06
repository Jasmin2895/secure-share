import path from 'path';
import config from 'config';

import { log, delay, fileExists, getQRCodeFilesDir, getValueFromDB } from '../../utils';
import { postChatMessage, uploadFile, deleteFile } from '../slack';

// Reports
import getUserQRCodes from './getUserQRCodes';

// const slackConfig = config.get('slack');

const QRCODE_CONFIG = {
    qrcode: {
        name: "QR Code",
        namePrefix: "qrCode",
        type: "png",
        func: getUserQRCodes,
    }
}

const generateCodesImplAsync = async (options, { slackReqObj }) => {
    const {
        reportName,
        reportTmpName,
        reportType,
        reportFilePath,
        reportFunc,
    } = options;

    try {
        // Initiate report function
        await reportFunc();

        /*
          FIX ME::
          Delay hack to ensure previous fs call is done processing file
        */
        await delay(250);
        const reportExists = await fileExists(reportFilePath);

        if (reportExists === false) {
            const message = {
                responseUrl: slackReqObj.response_url,
                replaceOriginal: false,
                text: `There's currently no data for report *${reportName}*`,
                mrkdwn: true,
                mrkdwn_in: ['text'],
            };
            return postChatMessage(message)
                .catch((ex) => {
                    log.error(ex);
                });
        }

        /*
          FIX ME::
          Delay hack to ensure previous fs call is done processing file
        */
        await delay(250);
        // find the workspace bot token with the help of team id
        let botUser = getValueFromDB(slackReqObj.teamId)
        console.log("botToken", botUser.token)

        const uploadedReport = await uploadFile({
            filePath: reportFilePath,
            fileTmpName: reportTmpName,
            fileName: reportName,
            fileType: reportType,
            channels: slackReqObj.channel_id,
            token: botUser.token
        });

        //call delete function after 30secs
        const message = {
            responseUrl: slackReqObj.response_url,
            replaceOriginal: false,
            text: 'Your QR Code is ready!',
            attachments: [{
                text: `<${uploadedReport.file.url_private}|${reportName}>`,
                color: '#2c963f',
                footer: 'Click the qr code link to open the file to download!',
            }],
        };
        await postChatMessage(message)
            .catch((err) => {
                log.error(err);
            });

        const deleteMessage = {
            responseUrl: slackReqObj.response_url,
            replaceOriginal: false,
            text: 'Your timelimit to download file has expired, the file is removed!',
            attachments: [{
                text: `Oops, file deleted!`,
                color: '#2c963f',
                footer: 'Attachment deleted!',
            }],
        };
        // call delete function 30secs
        await setTimeout(async () => {
            await deleteFile({ file: uploadedReport.file.id, token: botUser.token })
            await postChatMessage(deleteMessage)
                .catch((err) => {
                    log.error(err);
                });
        }, 30000)


        return;
        // const deleteFile = await deleteFile({ file: uploadedReport1.file.id })
    } catch (err) {
        log.error(err);
        const message = {
            responseUrl: slackReqObj.response_url,
            replaceOriginal: false,
            text: `Well this is embarrassing :sweat: I couldn't successfully get the report *${reportName}*. Please try again later as I look into what went wrong.`,
            mrkdwn: true,
            mrkdwn_in: ['text'],
        };
        return postChatMessage(message)
            .catch((ex) => {
                log.error(ex);
            });
    }
};

export const generateQRCode = async (options) => {
    try {
        let { msgToEncode, response_url, channel_id, teamId } = options;
        if (msgToEncode === undefined || msgToEncode.trim() === "") {
            log.error(new Error(`msgToEncode: sent empty string to encode`));
            const response = {
                response_type: 'in_channel',
                text: 'Hmmm :thinking_face: Seems like you sent empty message to encode. Please try again later as I look into what went wrong.',
            };

            return response;
        } else {
            // keeping qrcode as fixed as just now only encoding is done to QR Code
            const qrCode = QRCODE_CONFIG["qrcode"]
            let tempQrCodeName = `${qrCode.namePrefix}_${Date.now()}.${qrCode.type}`
            const qrCodeFilesDir = getQRCodeFilesDir();
            const qrCodeFilePath = path.join(qrCodeFilesDir, tempQrCodeName)

            //TODO - rename all report variables with some generic name
            const qrCodeParams = {
                reportName: qrCode.name,
                reportTmpName: tempQrCodeName,
                reportType: qrCode.type,
                reportFilePath: qrCodeFilePath,
                reportFunc() {
                    return qrCode.func({ qrCodeFilePath, msgToEncode });
                },
            };
            let slackReqObj = {
                response_url,
                channel_id,
                teamId
            }
            generateCodesImplAsync(qrCodeParams, { slackReqObj });

            const response = {
                responseUrl: slackReqObj.response_url,
                replaceOriginal: false,
                text: `Got it :thumbsup: Generating requested file *${qrCode.name}*\nPlease carry on, I'll notify you when I'm done.`,
                mrkdwn: true,
                mrkdwn_in: ['text'],
            };


            await postChatMessage(response)
                .catch((err) => {
                    log.error(err);
                });
            return response;
        }
    } catch (error) {
        throw error;
    }
}