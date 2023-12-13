const fs = require("fs");
const os = require("os");
const { log } = require("./logger");

const cmd = process.env.RUNINSTALL_CMD || process.argv0;
const cwd = process.cwd();
const tmpDir = os.tmpdir();
const historyFile = `${tmpDir}/runinstall-history.json`;
const historyLine = `${cwd} ${cmd}`;

function historySatisfied() {
  if (process.env.RUNINSTALL_FORCE) {
    return false;
  }
  let history;
  if (process.env.RUNINSTALL_DEBUG) {
    log({ cwd, cmd, historyFile, message: "runinstall history check" });
  }
  try {
    history = fs.readFileSync(historyFile, "utf-8");
  } catch (err) {
    // do nothing
  }
  return history === historyLine;
}

function writeHistory() {
  fs.writeFileSync(historyFile, historyLine);
}

module.exports = { historySatisfied, writeHistory };
