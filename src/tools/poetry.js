const fs = require("fs");
const {
  getPoetryRequirement,
  getPythonConstraint,
} = require("renovate/dist/modules/manager/poetry/artifacts");

async function detectPythonVersion() {
  try {
    const pyprojectContent = fs.readFileSync("pyproject.toml", "utf8");
    const poetryLockContent = fs.readFileSync("poetry.lock", "utf8");
    return getPythonConstraint(pyprojectContent, poetryLockContent) ?? undefined;
  } catch (err) {
    return undefined;
  }
}

async function detectPoetryVersion() {
  try {
    const pyprojectContent = fs.readFileSync("pyproject.toml", "utf8");
    const poetryLockContent = fs.readFileSync("poetry.lock", "utf8");
    return getPoetryRequirement(pyprojectContent, poetryLockContent) ?? undefined;
  } catch (err) {
    return undefined;
  }
}

async function getToolConstraints() {
  let toolConstraints = [];
  try {
    toolConstraints = [
      {
        toolName: "python",
        constraint: await detectPythonVersion()
      },
      {
        toolName: "poetry",
        constraint: await detectPoetryVersion()
      },
    ];
  } catch (ignored) {
  }

  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
