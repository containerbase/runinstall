# runinstall

## Logging

Runinstall does not log to stdio, because it might interfere with the Unified Agent's parsing of package manager output.
Instead, it sends its own logs to a remote CloudWatch Log Group.

Configuration:

- `RUNINSTALL_DEBUG`: If defined, logs will be output to console instead of, or in addition to, Cloudwatch
- `RUNINSTALL_KEY_ID`/`RUNINSTALL_ACCESS_KEY`: AWS credentials necessary for the remote Cloudwatch service

If all the above are undefined then Runinstall won't log a thing.

## Logic

### Path matching

If `RUNINSTALL_PATHS` is undefined, or does not match, then all logic will be skipped.
The command will be passed through to `/usr/local/bin/${cmd}`.

Example:

```
export RUNINSTALL_PATHS=org_a,org_b
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

### Constraint extraction

Next, Runinstall will attempt to extract constraints from the `cwd`.

### Install command generation

Runinstall will then map constraints to install commands.
This may require access to a github.com token in order to fetch release lists.

### Install command executation

Runinstall will then shell out to execute each install command.

### Command delegation

Finally, runinstall will execute the desired command - passing all stdio through - before then logging the result and exiting.
