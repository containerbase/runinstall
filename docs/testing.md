# Testing

Most of the code logic can be tested using unit tests.

The best way to test changes is against real repositories, using a built image.

## Building the image

You can build the image this way:

```
npm run build-binary
npm run build-image
```

You should see something like this:

```
 $ npm run build-binary && npm run build-image

> runinstall@0.0.1 build-binary
> pkg src/index.js --target node18-linux-x64  --output dist/runinstall

> pkg@5.8.1
> Warning Failed to make bytecode node18-x64 for file /snapshot/runinstall/node_modules/@isaacs/cliui/node_modules/string-width/index.js
> Warning Failed to make bytecode node18-x64 for file /snapshot/runinstall/node_modules/@isaacs/cliui/node_modules/strip-ansi/index.js
> Warning Failed to make bytecode node18-x64 for file /snapshot/runinstall/node_modules/@isaacs/cliui/node_modules/wrap-ansi/index.js
> Warning Failed to make bytecode node18-x64 for file /snapshot/runinstall/node_modules/@isaacs/cliui/node_modules/ansi-regex/index.js
> Warning Failed to make bytecode node18-x64 for file /snapshot/runinstall/node_modules/@isaacs/cliui/node_modules/ansi-styles/index.js

> runinstall@0.0.1 build-image
> docker build . -t containerbase/runinstall

[+] Building (11/11) FINISHED                                                                                                                                                                                                                                                                          docker:default
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 625B
 => [internal] load metadata for ghcr.io/containerbase/base:10.3.3@sha256:2229a04d052999d2e46439dd735a7a64ac1b250f82148a2df9338054014dd289
 => [internal] load .dockerignore
 => => transferring context: 2B
 => [1/6] FROM ghcr.io/containerbase/base:10.3.3@sha256:2229a04d052999d2e46439dd735a7a64ac1b250f82148a2df9338054014dd289
 => [internal] load build context
 => => transferring context: 192.87MB
 => CACHED [2/6] RUN prepare-tool all
 => [3/6] COPY dist/runinstall /home/ubuntu/bin/runinstall
 => [4/6] RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/mvn
 => [5/6] RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/pipenv
 => [6/6] RUN ln -s /home/ubuntu/bin/runinstall /home/ubuntu/bin/poetry
 => exporting to image
 => => exporting layers
 => => writing image sha256:67e4a92695868a502c55ad9a227859ddac1a24bd7a870006267e940d0e3115c3
 => => naming to docker.io/containerbase/runinstall   
 ```

 Now your custom-built image is ready to test against.

## Running the image

With Docker installed, and a GitHub PAT configured in `RUNINSTALL_GITHUB_TOKEN` on your local system, start the image this way:

```
docker run --rm -it -e RUNINSTALL_DEBUG=1 -e RUNINSTALL_FORCE=1 -e RUNINSTALL_MATCH=http -e  RUNINSTALL_GITHUB_TOKEN -w /tmp containerbase/runinstall /bin/bash 
```

## Testing against a repository

Next you want to clone a test repository to test against.

For example:

```
git clone https://github.com/LorenzoBettini/maven-java8-app-example
cd maven-java8-app-example/my-app-java8/
mvn --version
```

You should then see something like this:

```
Using console logger
{"args":["--version"],"cmd":"mvn","constraint":"8","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","found":true,"level":"info","location":"maven.compiler.release","message":"tool result","rawConstraint":"8","tool":"java"}
{"args":["--version"],"cmd":"mvn","constraint":"3.6.0","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","found":true,"level":"info","location":"maven-compiler-plugin.version","message":"tool result","rawConstraint":"3.6.0","tool":"maven"}
{"args":["--version"],"cmd":"mvn","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","level":"info","message":"Runinstall: Found no token file"}
{"args":["--version"],"cmd":"install-tool java 8.0.402+6","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","level":"info","message":"install-tool result","res":{"output":[null,"installing v2 tool java v8.0.402+6\nlinking tool java v8.0.402+6\nopenjdk version \"1.8.0_402\"\nOpenJDK Runtime Environment (Temurin)(build 1.8.0_402-b06)\nOpenJDK 64-Bit Server VM (Temurin)(build 25.402-b06, mixed mode)\n",""],"pid":45,"signal":null,"status":0,"stderr":"","stdout":"installing v2 tool java v8.0.402+6\nlinking tool java v8.0.402+6\nopenjdk version \"1.8.0_402\"\nOpenJDK Runtime Environment (Temurin)(build 1.8.0_402-b06)\nOpenJDK 64-Bit Server VM (Temurin)(build 25.402-b06, mixed mode)\n"},"success":true,"tool":"java","version":"8.0.402+6"}
{"args":["--version"],"cmd":"install-tool maven 3.6.0","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","level":"info","message":"install-tool result","res":{"output":[null,"",""],"pid":172,"signal":null,"status":0,"stderr":"","stdout":""},"success":true,"tool":"maven","version":"3.6.0"}
Apache Maven 3.6.0 (97c98ec64a1fdfee7767ce5ffb20918da4f719f3; 2018-10-24T18:41:47Z)
Maven home: /opt/containerbase/tools/maven/3.6.0
Java version: 1.8.0_402, vendor: Temurin, runtime: /opt/containerbase/tools/java/8.0.402+6/jre
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "5.15.146.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
{"args":["--version"],"cmd":"mvn","cwd":"/tmp/maven-java8-app-example/my-app-java8","environment":"default","installCommands":["install-tool java 8.0.402+6","install-tool maven 3.6.0"],"installSuccess":true,"level":"info","message":"runinstall result","remote":"https://github.com/LorenzoBettini/maven-java8-app-example","runSuccess":true,"toolConstraints":[{"constraint":"8","rawConstraint":"8","source":"maven.compiler.release","toolName":"java"},{"constraint":"3.6.0","source":"maven-compiler-plugin.version","toolName":"maven"}]}
```

From the above we can see that Java 8 and Maven 3.6.0 were detected and installed.