const { spawnSync } = require("child_process");

function getRemote() {
  if (!process.env.RUNINSTALL_MATCH) {
    return null;
  }
  try {
    const res = spawnSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf-8",
      shell: true,
    });
    return res.stdout.replace(/\n$/, "");
  } catch (err) {
    // do nothing
  }
  return null;
}

function matchPath(remote) {
  if (!process.env.RUNINSTALL_MATCH) {
    return false;
  }
  if (!remote) {
    return false;
  }
  const paths = process.env.RUNINSTALL_MATCH.split(",");
  if (paths.some((p) => remote.includes(p))) {
    return true;
  }
  return false;
}

module.exports = { getRemote, matchPath };
