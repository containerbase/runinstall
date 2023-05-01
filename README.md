# Runinstall

## Logic

### Path matching

If `RUNINSTALL_MATCH` is undefined, or does not match, then all logic will be skipped.
The command will be passed through to `/usr/local/bin/${cmd}`.

Example:

```
export RUNINSTALL_MATCH=org_a,org_b
mvn --version
```

### Tool name checking

Runinstall only works for `mvn`, `pipenv` and `poetry`.
If any other command is used, the command will exit with an error.

In development, the command can be overridden/hardcoded with `RUNINSTALL_CMD`.

Example:

```
export RUNINSTALL_CMD=mvn
node src/index.js --version
```

### History checking

Runinstall will skip all remaining logic if the same command has been run in the same directory right immediately before.
It achieves this by writing the previous command to `/tmp/runinstall_history`.

This can be overridden by setting `RENOVATE_FORCE=1`, which means Runinstall will ignore the history.

### Constraint extraction

Next, Runinstall will attempt to extract constraints from the `cwd`.

### Install command generation

If no constaints were found in the previous step, Runinstall will skip install command generation and not install anything.
To override this and instruct Runinstall to install every time, set `RUNINSTALL_ALWAYS_INSTALL=1`.

Runinstall then maps constraints to install commands.
This may require access to a github.com token in order to fetch release lists.

The token is found from either:
- `.gitAccessToken` in the file system in the current directory or a parent directory, or
- From `RUNINSTALL_GITHUB_TOKEN` (used as a fallback)

### Install command executation

Runinstall will then shell out to execute each install command.

### Command delegation

Finally, runinstall will execute the desired command - passing all stdio through - before then logging the result and exiting.

## Logging

Runinstall does not log to standard output or eerror, because doing so might interfere with the Unified Agent's parsing of package manager output.
Instead, Runinstall sends its own logs to a remote CloudWatch Log Group if configured.

Configuration:

- `RUNINSTALL_DEBUG`: If defined, logs will be output to console instead of, or in addition to, Cloudwatch
- `RUNINSTALL_KEY_ID`/`RUNINSTALL_ACCESS_KEY`: AWS credentials necessary for the remote Cloudwatch service

If all the above are undefined then Runinstall won't log a thing.

At the end of an invocation, Runinstall creates a log like the following:

```
{
  "args": [
    "install"
  ],
  "cmd": "poetry",
  "cwd": "/tmp/ws-scm/poetry-project",
  "installCommands": [
    "install-tool python 3.10.11",
    "install-tool poetry 1.4.2"
  ],
  "installSuccess": true,
  "level": "info",
  "message": "runinstall result",
  "remote": "https://github.com/dawsonbooth/poetry-project",
  "runSuccess": true,
  "toolConstraints": [
    {
      "constraint": ">=3.8,<3.11",
      "toolName": "python"
    },
    {
      "constraint": ">=0.12",
      "toolName": "poetry"
    }
  ]
}
```