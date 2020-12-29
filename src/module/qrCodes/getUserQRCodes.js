const QRCode = require('qrcode')

export default async (options) => {
    try {
        const { qrCodeFilePath, msgToEncode } = options;
        QRCode.toFile(qrCodeFilePath, msgToEncode, {
            color: {
                dark: '#FFFFFF',  // Black image
                light: '#000000' // Transparent background
            }
        }, function (err) {
            if (err) throw err
            console.log('done')
        })
    } catch (err) {
        throw err;
    }
};