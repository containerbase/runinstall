const winston = require("winston");
const WinstonCloudWatch = require("winston-cloudwatch");

let logger;

function getLogger() {
  if (!logger) {
    if (process.env.CLOUDWATCH_KEY_ID && process.env.CLOUDWATCH_ACCESS_KEY) {
      logger = winston.createLogger({
        // format: winston.format.json(),
        transports: [
          new WinstonCloudWatch({
            name: "runinstall",
            logGroupName: "runinstall",
            logStreamName: "runinstall",
            awsOptions: {
              accessKeyId: process.env.CLOUDWATCH_KEY_ID,
              secretAccessKey: process.env.CLOUDWATCH_ACCESS_KEY,
              region: "us-west-2",
            },
            jsonMessage: true,
          }),
        ],
      });
      if (process.env.LOG_CONSOLE) {
        logger.add(
          new winston.transports.Console({
            format: winston.format.json(),
          })
        );
      }
    } else if (process.env.LOG_CONSOLE) {
      console.log("Using console logger");
      logger = winston.createLogger({
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
      });
    } else {
      logger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };
    }
  }
  return logger;
}

module.exports = {
  getLogger,
};
