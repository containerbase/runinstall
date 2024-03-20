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
    if (!plugin && build.childNamed("pluginManagement")) {
      const pluginManagement = build.childNamed("pluginManagement");
      if (pluginManagement.childNamed("plugins")) {
        const plugins = pluginManagement.childNamed("plugins");
        for (const p of plugins.childrenNamed("plugin")) {
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
  return plugin;
}

function massageConstraint(originalConstraint, logMeta) {
  let constraint = originalConstraint;
  if (constraint === "1.7" || constraint === "1.7.0") {
    constraint = "8";
  }
  if (constraint === "1.8" || constraint === "1.8.0") {
    constraint = "8";
  }
  constraint = constraint.replace(/^\[(.*?),/, `^$1,`).replace(/,\)$/, "");
  if (isValid(constraint)) {
    return constraint;
  }
  log({
    ...logMeta,
    message: "Runinstall: Could not massage constraint " +
      originalConstraint +
      " to " +
      constraint
  });
  return undefined;
}

function detectJavaVersion(pomXmlContent, logMeta) {
  let source;
  let constraint;
  let rawConstraint;
  const enforcer = getEnforcerPlugin(pomXmlContent);
  if (enforcer) {
    if (enforcer.childNamed("executions")) {
      const executions = enforcer.childNamed("executions");
      let execution;
      for (const e of executions.childrenNamed("execution")) {
        if (e.childNamed("id").val === "enforce-maven" || e.childNamed("id").val === "enforce-requirements") {
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
                constraint = massageConstraint(rawConstraint, logMeta);
                log({
                  ...logMeta,
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
        source = "maven-compiler-plugin.source";
        rawConstraint = configuration.childNamed("source").val;
        constraint = massageConstraint(rawConstraint, logMeta);
        log({
          ...logMeta,
          tool: "java",
          constraint,
          rawConstraint,
          found: true,
          location: "maven-compiler-plugin.source",
          message: "tool result",
        });
      } else if (configuration.childNamed("release")) {
        source = "maven-compiler-plugin.release";
        rawConstraint = configuration.childNamed("release").val;
        constraint = massageConstraint(rawConstraint, logMeta);
        log({
          ...logMeta,
          tool: "java",
          constraint,
          rawConstraint,
          found: true,
          location: "maven-compiler-plugin.release",
          message: "tool result",
        });
      }
    }
  }
  if (constraint) {
    return { source, constraint, rawConstraint };
  }
  if (pomXmlContent.childNamed("properties")) {
    const properties = pomXmlContent.childNamed("properties");
    if (properties.childNamed("maven.compiler.source")) {
      source = "maven.compiler.source";
      rawConstraint = properties.childNamed("maven.compiler.source").val;
      constraint = massageConstraint(rawConstraint, logMeta);
      log({
        ...logMeta,
        tool: "java",
        constraint,
        rawConstraint,
        found: true,
        location: "maven.compiler.source",
        message: "tool result",
      });
    } else if (properties.childNamed("maven.compiler.release")) {
      source = "maven.compiler.release";
      rawConstraint = properties.childNamed("maven.compiler.release").val;
      constraint = massageConstraint(rawConstraint, logMeta);
      log({
        ...logMeta,
        tool: "java",
        constraint,
        rawConstraint,
        found: true,
        location: "maven.compiler.release",
        message: "tool result",
      });
    } else if (properties.childNamed("java.version")) {
      source = "java.version";
      rawConstraint = properties.childNamed("java.version").val;
      constraint = massageConstraint(rawConstraint, logMeta);
      log({
        ...logMeta,
        tool: "java",
        constraint,
        rawConstraint,
        found: true,
        location: "java.version",
        message: "tool result",
      });
    }
  }
  return { source, constraint, rawConstraint };
}

function detectMavenVersion(pomXmlContent, logMeta) {
  let constraint;
  let source;
  const plugin = getEnforcerPlugin(pomXmlContent);
  if (plugin) {
    if (plugin.childNamed("executions")) {
      const executions = plugin.childNamed("executions");
      let execution;
      for (const e of executions.childrenNamed("execution")) {
        if (e.childNamed("id").val === "enforce-maven" || e.childNamed("id").val === "enforce-requirements") {
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
                  ...logMeta,
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
  if (constraint) {
    return { source, constraint };
  }
  const mavenCompiler = getMavenCompilerPlugin(pomXmlContent);
  if (mavenCompiler.childNamed("version")) {
    source = "maven-compiler-plugin.version";
    rawConstraint = mavenCompiler.childNamed("version").val;
    constraint = massageConstraint(rawConstraint, logMeta);
    log({
      ...logMeta,
      tool: "maven",
      constraint,
      rawConstraint,
      found: true,
      location: "maven-compiler-plugin.version",
      message: "tool result",
    });
  }
  return { source, constraint };
}

function getToolConstraints(logMeta) {
  let pomXmlContent;
  try {
    const raw = fs.readFileSync("pom.xml", "utf8");
    // log({ pomXml: raw, message: "pom.xml content" });
    pomXmlContent = new XmlDocument(raw);
  } catch (err) {
    // No pom.xml found
  }
  if (!pomXmlContent) {
    log({ ...logMeta, cwd: process.cwd(), message: "Runinstall: No pom.xml content found." });
    return [];
  }

  const toolConstraints = [
    {
      toolName: "java",
      ...detectJavaVersion(pomXmlContent, logMeta),
    },
    {
      toolName: "maven",
      ...detectMavenVersion(pomXmlContent, logMeta),
    },
  ];
  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
