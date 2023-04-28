const fs = require("fs");
const { XmlDocument } = require("xmldoc");
const { isValid } = require("renovate/dist/modules/versioning/npm");
const { getLogger } = require("../logger");

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
  logger.info(
    "Runinstall: Could not massage constraint " +
      originalConstraint +
      " to " +
      constraint
  );
  return undefined;
}

function detectJavaVersion(pomXmlContent) {
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
            const rule = rules.childNamed("requireJavaVersion");
            if (rule) {
              if (rule.childNamed("version")) {
                javaConstraint = rule.childNamed("version").val;
                logger.info({
                  tool: "java",
                  constraint: javaConstraint,
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
  return massageConstraint(javaConstraint) ?? "17";
}

function detectMavenVersion(pomXmlContent) {
  logger = getLogger();
  let mavenConstraint;
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
                mavenConstraint = rule.childNamed("version").val;
                logger.info({
                  tool: "maven",
                  constraint: mavenConstraint,
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
  return mavenConstraint;
}

function getToolConstraints() {
  logger = getLogger();
  let pomXmlContent;
  try {
    const raw = fs.readFileSync("pom.xml", "utf8");
    pomXmlContent = new XmlDocument(raw);
  } catch (err) {
    // No pom.xml found
  }
  if (!pomXmlContent) {
    logger.info("Runinstall: No pom.xml content found.");
    return [];
  }
  const toolConstraints = [
    {
      toolName: "java",
      constraint: detectJavaVersion(pomXmlContent),
    },
    {
      toolName: "maven",
      constraint: detectMavenVersion(pomXmlContent),
    },
  ];
  return toolConstraints;
}

module.exports = {
  getToolConstraints,
};
