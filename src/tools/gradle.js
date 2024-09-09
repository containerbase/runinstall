const fs = require("fs");
const {log} = require("../logger");
const { regEx } = require("renovate/dist/util/regex");
const { getJavaConstraint } = require("renovate/dist/modules/manager/gradle-wrapper/utils");

const newlineRegex = regEx(/\r?\n/);
const DISTRIBUTION_URL_REGEX = regEx(
    '^(?:distributionUrl\\s*=\\s*)(\\S*-(?<version>\\d+\\.\\d+(?:\\.\\d+)?(?:-\\w+)*)-(bin|all)\\.zip)\\s*$',
);

const GRADLE_VERSION_REGEX = regEx("gradleVersion\\s*=\\s*[\"']?\\s*(?<version>\\d+\\.\\d+(?:\\.\\d+)?(?:-\\w+)*)[\"']?");

function extractGradleWrapperVersion(
    logMeta,
    fileContent,
) {
    const lines = fileContent?.split(newlineRegex) ?? [];

    for (const line of lines) {
        const distributionUrlMatch = DISTRIBUTION_URL_REGEX.exec(line);

        if (distributionUrlMatch?.groups) {
            return distributionUrlMatch.groups.version;
        }
    }
    log(...logMeta,
        'Gradle wrapper version was not found in gradle-wrapper.properties',
    );

    return null;
}

// returns url + version or null
function extractGradleVersion(
    logMeta,
    fileContent,
) {
    const lines = fileContent?.split(newlineRegex) ?? [];

    for (const line of lines) {
        const gradleVer = GRADLE_VERSION_REGEX.exec(line);

        if (gradleVer?.groups) {
            return gradleVer.groups.version;
        }
    }
    log(...logMeta,
        'Gradle version was not found in build.gradle',
    );

    return null;
}


function  getToolConstraints(logMeta, inputFilePath) {
    let gradleExtract;

    let wrapperProps = 'gradle/wrapper/gradle-wrapper.properties';
    let gradleProps = 'gradle.properties';
    let buildGradle = 'build.gradle';

    if (inputFilePath) {
        // for testing
        wrapperProps = inputFilePath;
        gradleProps = inputFilePath;
        buildGradle = inputFilePath;
    }

    let isWrapper = false;

    try {
        const props = fs.readFileSync(wrapperProps, "utf8");
        gradleExtract = extractGradleWrapperVersion(logMeta, props ?? '');
        isWrapper = true;
    } catch (err) {
        // No file found
    }

    if (!gradleExtract) {
        try {
             const props = fs.readFileSync(gradleProps, "utf8");
             gradleExtract = extractGradleVersion(logMeta, props ?? '');
        } catch (err) {
            // No file found
        }
    }

    if (!gradleExtract) {
        try {
            const bg = fs.readFileSync(buildGradle, "utf8");
            gradleExtract = extractGradleVersion(logMeta, bg ?? '');
        } catch (err) {
            // No file found
        }
    }

    if (!gradleExtract) {
        log({ ...logMeta, cwd: process.cwd(), message: "Runinstall: No version found." });
        return [];
    }

    const javaConstraint = getJavaConstraint(gradleExtract)

    const toolConstraints = [];
    toolConstraints.push({source: 'gradle',constraint: javaConstraint, toolName: 'java'});
    if (!isWrapper) {
        toolConstraints.push({source: 'gradle',constraint: gradleExtract, toolName: 'gradle'});
    }

    return toolConstraints;
}

module.exports = {
    getToolConstraints,
};