const { spawnSync } = require("child_process");
const containerbase = require("renovate/dist/util/exec/containerbase");
const hostRules = require("renovate/dist/util/host-rules");
const { log } = require("./logger");
const { findToken } = require("./token");

async function generateInstallCommands(toolConstraints) {
  if (
    !process.env.RUNINSTALL_ALWAYS_INSTALL &&
    toolConstraints.every((tc) => tc.constraint === undefined)
  ) {
    if (process.env.RUNINSTALL_DEBUG) {
      log({
        message: "Runinstall: No tool constraints found, skipping installation",
      });
    }
    return [];
  }
  const token =
    (await findToken()) ?? process.env.RUNINSTALL_GITHUB_TOKEN;
  if (token) {
    hostRules.add({
      matchHost: "api.github.com",
      token,
    });
  } else {
    log({
      error: true,
      message:
        "Runinstall: No github.com token set, tool installations may fail",
    });
  }
  let installCommands = [];
  try {
    installCommands = await containerbase.generateInstallCommands(
      toolConstraints
    );
  } catch (err) {
    log({
      error: true,
      err,
      message: "Runinstall: Error generating installation commands",
    });
  }
  return installCommands;
}

function installTools(commands) {
  let success;
  for (const cmd of commands) {
    let res;
    let err;
    try {
      res = spawnSync(cmd, { encoding: "utf-8", shell: true });
      success = res.status === 0;
    } catch (err_) {
      err = err_;
      success = false;
    }
    log({
      res,
      err,
      success: !err && !res.error && res.status !== 1,
      cmd,
      tool: cmd.split(" ")[1],
      version: cmd.split(" ")[2],
      message: "install-tool result",
    });
  }
  return success;
}

module.exports = {
  generateInstallCommands,
  installTools,
};
