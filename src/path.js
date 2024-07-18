const git = require("./git");

let enableNoGit = process.env.RUNINSTALL_ENABLE_NO_GIT;
let riMatch = process.env.RUNINSTALL_MATCH; // deprecated
let includes = process.env.RUNINSTALL_INCLUDES;
let excludes = process.env.RUNINSTALL_EXCLUDES;

function skipToolInstall() {
  if (enableNoGit === 'true') {
    // always enabled without a git check
    return false;
  }

  if (!includes) {
    includes = riMatch; // backward compatability
  }
  if (!includes) {
    // includes is not defined, nothing to match
    return true;
  }

  const remote = git.getRemote();
  if (!remote) {
    // could not find remote
    return true;
  }

  if (excludes) {
    const excPaths = excludes.split(",");
    if (excPaths.some((p) => remote.includes(p))) {
      // This means runinstall should not be active on this repo
      return true;
    }
  }

  const incPaths = includes.split(",");
  const matchFound = incPaths.some((p) => remote.includes(p));
  return !matchFound;
}

// setters for testing
function setEnableNoGit(value) {
  enableNoGit = value;
}
function setRiMatch(value) {
  riMatch = value;
}
function setIncludes(value) {
  includes = value;
}
function setExcludes(value) {
  excludes = value;
}

module.exports = {
  setEnableNoGit,
  setRiMatch,
  setIncludes,
  setExcludes,
  skipToolInstall
};
