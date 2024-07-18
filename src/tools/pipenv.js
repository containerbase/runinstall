const fs = require("fs");
const {
  getPipenvConstraint,
  getPythonConstraint,
} = require("renovate/dist/modules/manager/pipenv/artifacts");

function detectPythonVersion(pipenvLockContent) {
  let pythonConstraint;
  try {
    pythonConstraint = getPythonConstraint(pipenvLockContent, {});
  } catch (err) {
    // Intentionally return undefined
  }
  return pythonConstraint;
}

async function detectPipenvVersion(pipenvLockContent) {
  let pipenvConstraint;
  try {
    pipenvConstraint = getPipenvConstraint(pipenvLockContent);
  } catch (err) {
    // Intentionally return undefined
  }
  return pipenvConstraint;
}

async function getToolConstraints() {
  let pipenvLockContent;
  try {
    pipenvLockContent = fs.readFileSync("Pipfile.lock", "utf8");
  } catch (err) {
    // No Pipfile.lock found
  }

  let toolConstraints = [];
  try {
    toolConstraints = [
      {
        toolName: "python",
        constraint: await detectPythonVersion(pipenvLockContent),
      },
      {
        toolName: "pipenv",
        constraint: await detectPipenvVersion(pipenvLockContent),
      },
    ];
  } catch (err) {
  }

  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
