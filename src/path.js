function matchPath() {
  if (!process.env.RUNINSTALL_PATHS) {
    return false;
  }
  const cwd = process.cwd();
  const paths = process.env.RUNINSTALL_PATHS.split(",");
  if (paths.some((p) => cwd.includes(p))) {
    return true;
  }
  return false;
}

module.exports = { matchPath };
