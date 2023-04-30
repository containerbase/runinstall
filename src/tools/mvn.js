const fs = require("fs");
const { XmlDocument } = require("xmldoc");
const { isValid } = require("renovate/dist/modules/versioning/npm");
const { log } = require("../logger");

let logger;

function getEnforcerPlugin(pomXmlContent) {
  let plugin;
  if (pomXmlContent.childNamed("build")) {
    const build = pomXmlContent.childNamed("build");
    if (build.childNamed("plugins")) {
      const plugins = build.childNamed("plugins");
      for (const p of plugins.childrenNamed("plugin")) {
        if (p.childNamed("groupId")) {
          const groupId = p.childNamed("groupId").val;
          if (groupId === "org.apache.maven.plugins") {
            if (p.childNamed("artifactId")) {
              const artifactId = p.childNamed("artifactId").val;
              if (artifactId === "maven-enforcer-plugin") {
                plugin = p;
              }
            }
          }
        }
      }
    }
  }
  return plugin;
}

function getMavenCompilerPlugin(pomXmlContent) {
  let plugin;
  if (pomXmlContent.childNamed("build")) {
    const build = pomXmlContent.childNamed("build");
    if (build.childNamed("plugins")) {
      const plugins = build.childNamed("plugins");
      for (const p of plugins.childrenNamed("plugin")) {
        if (p.childNamed("groupId")) {
          const groupId = p.childNamed("groupId").val;
          if (groupId === "org.apache.maven.plugins") {
            if (p.childNamed("artifactId")) {
              const artifactId = p.childNamed("artifactId").val;
              if (artifactId === "maven-compiler-plugin") {
                plugin = p;
              }
            }
          }
        }
      }
    }
  }
  return plugin;
}

function massageConstraint(originalConstraint) {
  let constraint = originalConstraint;
  if (constraint === "1.7") {
    constraint = "8";
  }
  if (constraint === "1.8") {
    constraint = "8";
  }
  constraint = constraint.replace(/^\[(.*?),/, `^$1,`).replace(/,\)$/, "");
  if (isValid(constraint)) {
    return constraint;
  }
  log(
    "Runinstall: Could not massage constraint " +
      originalConstraint +
      " to " +
      constraint
  );
  return undefined;
}

function detectJavaVersion(pomXmlContent) {
  let source;
  let constraint;
  let rawConstraint;
  const enforcer = getEnforcerPlugin(pomXmlContent);
  if (enforcer) {
    if (enforcer.childNamed("executions")) {
      const executions = enforcer.childNamed("executions");
      let execution;
      for (const e of executions.childrenNamed("execution")) {
        if (e.childNamed("id").val === "enforce-maven") {
          execution = e;
        }
      }
      if (execution) {
        if (execution.childNamed("configuration")) {
          const configuration = execution.childNamed("configuration");
          if (configuration.childNamed("rules")) {
            const rules = configuration.childNamed("rules");
            const rule = rules.childNamed("requireJavaVersion");
            if (rule) {
              if (rule.childNamed("version")) {
                source = "enforce-maven";
                rawConstraint = rule.childNamed("version").val;
                constraint = massageConstraint(rawConstraint);
                log({
                  tool: "java",
                  constraint,
                  rawConstraint,
                  found: true,
                  location: "enforce-maven",
                  message: "tool result",
                });
              }
            }
          }
        }
      }
    }
  }
  if (constraint) {
    return { source, constraint, rawConstraint };
  }
  const mavenCompiler = getMavenCompilerPlugin(pomXmlContent);
  if (mavenCompiler) {
    if (mavenCompiler.childNamed("configuration")) {
      const configuration = mavenCompiler.childNamed("configuration");
      if (configuration.childNamed("source")) {
        source = "maven-compiler-plugin";
        rawConstraint = configuration.childNamed("source").val;
        constraint = massageConstraint(rawConstraint);
        log({
          tool: "java",
          constraint,
          rawConstraint,
          found: true,
          location: "maven-compiler-plugin",
          message: "tool result",
        });
      }
    }
  }
  return { source, constraint, rawConstraint };
}

function detectMavenVersion(pomXmlContent) {
  let constraint;
  let source;
  const plugin = getEnforcerPlugin(pomXmlContent);
  if (plugin) {
    if (plugin.childNamed("executions")) {
      const executions = plugin.childNamed("executions");
      let execution;
      for (const e of executions.childrenNamed("execution")) {
        if (e.childNamed("id").val === "enforce-maven") {
          execution = e;
        }
      }
      if (execution) {
        if (execution.childNamed("configuration")) {
          const configuration = execution.childNamed("configuration");
          if (configuration.childNamed("rules")) {
            const rules = configuration.childNamed("rules");
            const rule = rules.childNamed("requireMavenVersion");
            if (rule) {
              if (rule.childNamed("version")) {
                source = "enforce-maven";
                constraint = rule.childNamed("version").val;
                log({
                  tool: "maven",
                  constraint: constraint,
                  found: true,
                  location: "enforce-maven",
                  message: "tool result",
                });
              }
            }
          }
        }
      }
    }
  }
  return { source, constraint };
}

function getToolConstraints() {
  let pomXmlContent;
  try {
    const raw = fs.readFileSync("pom.xml", "utf8");
    log({ pomXml: raw, message: "pom.xml content" });
    pomXmlContent = new XmlDocument(raw);
  } catch (err) {
    // No pom.xml found
  }
  if (!pomXmlContent) {
    log("Runinstall: No pom.xml content found.");
    return [];
  }
  const toolConstraints = [
    {
      toolName: "java",
      ...detectJavaVersion(pomXmlContent),
    },
    {
      toolName: "maven",
      ...detectMavenVersion(pomXmlContent),
    },
  ];
  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
