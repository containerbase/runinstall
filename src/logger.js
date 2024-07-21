const winston = require("winston");
const WinstonCloudWatch = require("winston-cloudwatch");

let logger;

function getLogger() {
  if (!logger) {
    if (process.env.RUNINSTALL_KEY_ID && process.env.RUNINSTALL_ACCESS_KEY) {
      logger = winston.createLogger({
        // format: winston.format.json(),
        transports: [
          new WinstonCloudWatch({
            name: "runinstall",
            logGroupName: "runinstall",
            logStreamName: "runinstall",
            awsOptions: {
              credentials: {
                accessKeyId: process.env.RUNINSTALL_KEY_ID,
                secretAccessKey: process.env.RUNINSTALL_ACCESS_KEY,
              },
              region: process.env.AWS_REGION || "us-west-2",
            },
            jsonMessage: true,
          }),
        ],
      });
      if (process.env.RUNINSTALL_DEBUG) {
        console.info("Adding console logger");
        logger.add(
          new winston.transports.Console({
            format: winston.format.json(),
          })
        );
      }
    } else if (process.env.RUNINSTALL_DEBUG) {
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

function log(...args) {
  logger = logger || getLogger();
  logger.info(...args);
}

function shutdown(status) {
  // Flush the logs if necessary, then exit
  if (!logger || !logger.transports) {
    process.exit(status);
  }

  const transport = logger.transports.find((t) => t.name === "runinstall");
  if (!transport) {
    process.exit(status);
  }

  transport.kthxbye(function () {
    // Wait for log flushing before shutting down
    process.exit(status);
  });
}

module.exports = {
  log,
  shutdown,
};
