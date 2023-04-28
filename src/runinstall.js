process.env.LOG_LEVEL = "warn";
process.env.SKIP_VERSION = "1";

const { spawnSync } = require("child_process");
const {
  generateInstallCommands,
} = require("renovate/dist/util/exec/containerbase");
const hostRules = require("renovate/dist/util/host-rules");

const mvn = require("./tools/mvn");
const pipenv = require("./tools/pipenv");
const poetry = require("./tools/poetry");

const { getLogger } = require("./logger");

const tools = {
  mvn,
  pipenv,
  poetry,
};

const spawnOpts = {
  shell: true,
  stdio: "inherit",
};

const cmd = process.env.RUNINSTALL_CMD || process.argv0;
const args = process.argv.slice(2);
const cwd = process.cwd();

let logger;

async function detectTools() {
  if (!tools[cmd]) {
    logger.error({ cmd, args, cwd, message: `Unknown command` });
    process.exit(-1);
  }
  const toolConstraints = await tools[cmd].getToolConstraints();
  if (toolConstraints.every((tc) => tc.constraint === undefined)) {
    logger.info({
      found: false,
      message: "Runinstall constraints",
    });
    return [];
  }
  logger.info({
    found: true,
    message: "Runinstall constraints",
    toolConstraints,
  });
  if (process.env.GITHUB_COM_TOKEN) {
    hostRules.add({
      matchHost: "api.github.com",
      token: process.env.GITHUB_COM_TOKEN,
    });
  } else {
    logger.warn(
      "Runinstall: No GITHUB_COM_TOKEN env var set, tool installations may fail"
    );
  }
  let installCommands = [];
  try {
    installCommands = await generateInstallCommands(toolConstraints);
  } catch (err) {
    logger.error({
      err,
      message: "Runinstall: Error generating installation commands",
    });
  }
  return installCommands;
}

function installTools(commands) {
  for (const cmd of commands) {
    let res;
    let err;
    try {
      res = spawnSync(cmd, { encoding: "utf-8", shell: true });
    } catch (err_) {
      err = err_;
    }
    logger[err || (res && !res.error) ? "info" : "error"]({
      res,
      err,
      success: !err && !res.error,
      cmd,
      tool: cmd.split(" ")[1],
      version: cmd.split(" ")[2],
      message: "install-tool result",
    });
  }
}

function delegateCommand() {
  return spawnSync(`/usr/local/bin/${cmd}`, args, spawnOpts);
}

function matchPath() {
  if (!process.env.RUNINSTALL_PATHS) {
    return false;
  }
  const paths = process.env.RUNINSTALL_PATHS.split(",");
  if (paths.some((p) => cwd.includes(p))) {
    return true;
  }
  return false;
}

(async function () {
  if (matchPath()) {
    // This means runinstall should be active on this repo
    logger = getLogger();
    const commands = await detectTools();
    if (commands?.length) {
      installTools(commands);
    }
  }
  // Pass on the command to the "real" tool
  const res = delegateCommand();

  // Flush the logs if necessary, then exit
  const transport =
    logger &&
    logger.transports &&
    logger.transports.find((t) => t.name === "runinstall");
  if (transport) {
    transport.kthxbye(function () {
      // Wait for log flushing before shutting down
      process.exit(res.status);
    });
  } else {
    process.exit(res.status);
  }
})();
