const fs = require("fs");
const {
  getPipenvRequirement,
  getPythonConstraint,
} = require("renovate/dist/modules/manager/pipenv/artifacts");

async function detectPythonVersion(pipenvLockContent) {
  return getPythonConstraint(pipenvLockContent, {}) ?? "*";
}

async function detectPipenvVersion(pipenvLockContent) {
  return getPipenvRequirement(pipenvLockContent) ?? "*";
}

async function getToolConstraints() {
  const pipenvLockContent = fs.readFileSync("Pipfile.lock", "utf8");
  const toolConstraints = [
    {
      toolName: "python",
      constraint: await detectPythonVersion(pipenvLockContent),
    },
    {
      toolName: "poetry",
      constraint: await detectPipenvVersion(pipenvLockContent),
    },
  ];
  console.log(toolConstraints);
  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
