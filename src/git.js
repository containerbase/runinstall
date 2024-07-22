const { spawnSync } = require("child_process");

function getRemote() {
    try {
        const res = spawnSync("git", ["remote", "get-url", "origin"], {
            encoding: "utf-8",
            shell: true,
        });
        return res.stdout.replace(/\n$/, "");
    } catch (err) {
        // do nothing
    }
    return undefined;
}

module.exports = {
    getRemote,
};
