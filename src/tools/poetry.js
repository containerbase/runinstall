const fs = require("fs");
const {
  getPoetryRequirement,
  getPythonConstraint,
} = require("renovate/dist/modules/manager/poetry/artifacts");

async function detectPythonVersion() {
  try {
    const poetryLockContent = fs.readFileSync("poetry.lock", "utf8");
    return getPythonConstraint(poetryLockContent, {}) ?? undefined;
  } catch (err) {
    return undefined;
  }
}

async function detectPoetryVersion() {
  try {
    const pyprojectContent = fs.readFileSync("pyproject.toml", "utf8");
    return getPoetryRequirement(pyprojectContent) ?? undefined;
  } catch (err) {
    return undefined;
  }
}

async function getToolConstraints() {
  const toolConstraints = [
    { toolName: "python", constraint: await detectPythonVersion() },
    { toolName: "poetry", constraint: await detectPoetryVersion() },
  ];
  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
