const fs = require("fs");

const logReqRes = (filename) => {
    return (req, res, next) => {
        const logLine = `${new Date().toISOString()} - ${req.ip} - ${req.method} - ${
            req.path
        }\n`;
        fs.appendFile(filename, logLine, (err) => {
            if (err) console.error("Error writing to log file:", err);
            next();
        });
    };
};

module.exports = { logReqRes };
