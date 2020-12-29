import fs from 'fs';
import path from 'path';
import config from 'config';
import morgan from 'morgan';
import mkdirp from 'mkdirp';
import tracer from 'tracer';

export const log = (() => {
    const logger = tracer.colorConsole();
    logger.requestLogger = morgan('dev');
    return logger;
})();

export const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (Number.isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
};

export const delay = time => new Promise((resolve) => {
    setTimeout(() => { resolve(); }, time);
});

export const fileExists = async (filePath) => {
    let exists = true;
    try {
        fs.accessSync(filePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            exists = false;
        } else {
            throw err;
        }
    }
    return exists;
};

export const writeToCsv = ({ headers, records, filePath }) => {
    const writer = csvWriter({ headers });
    writer.pipe(fs.createWriteStream(filePath));
    records.forEach(r => writer.write(r));
    writer.end();
};

export const getQRCodeFilesDir = () => {
    let qrCodeFilesDir;
    try {
        qrCodeFilesDir = path.join(__dirname, `../${config.get("qrCodeFilesDir")}`);
        mkdirp.sync(qrCodeFilesDir);
        return qrCodeFilesDir;
    } catch (error) {
        throw error;
    }
}