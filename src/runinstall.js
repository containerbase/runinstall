const { spawnSync } = require("child_process");
const {
  generateInstallCommands,
} = require("renovate/dist/util/exec/containerbase");
const hostRules = require("renovate/dist/util/host-rules");

const pipenv = require("./tools/pipenv");
const poetry = require("./tools/poetry");

const tools = {
  pipenv,
  poetry,
};

const spawnOpts = {
  shell: true,
  stdio: "inherit",
};

(async function () {
  const cmd = process.argv0;
  const cmdArgs = process.argv.slice(2);
  console.log(
    `Running ${cmd} with args [${cmdArgs
      .map((cmd) => `"${cmd}"`)
      .join(", ")}] in ${process.cwd()}`
  );
  if (!tools[cmd]) {
    console.error(`Unknown command: ${cmd}`);
    process.exit(-1);
  }
  hostRules.add({
    matchHost: "api.github.com",
    token: process.env.GITHUB_RENOVATE_TESTS_TOKEN,
  });
  const toolConstraints = await tools[cmd].getToolConstraints();
  const installCommands = await generateInstallCommands(toolConstraints);
  for (const cmd of installCommands) {
    spawnSync(cmd, spawnOpts);
  }
  spawnSync(`/usr/local/bin/${cmd}`, cmdArgs, spawnOpts);
})();
