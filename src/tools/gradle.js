const fs = require("fs");
const {log} = require("../logger");
const { regEx } = require("renovate/dist/util/regex");
const { getJavaConstraint } = require("renovate/dist/modules/manager/gradle-wrapper/utils");

const newlineRegex = regEx(/\r?\n/);
const DISTRIBUTION_URL_REGEX = regEx(
    '^(?:distributionUrl\\s*=\\s*)(\\S*-(?<version>\\d+\\.\\d+(?:\\.\\d+)?(?:-\\w+)*)-(bin|all)\\.zip)\\s*$',
);

const GRADLE_VERSION_REGEX = regEx("gradleVersion\\s*=\\s*[\"']?\\s*(?<version>\\d+\\.\\d+(?:\\.\\d+)?(?:-\\w+)*)[\"']?");

/**
 * Extracts gradle version using DISTRIBUTION_URL_REGEX from a given gradle wrapper file.
 *
 * @param {Object} logMeta
 * @param {string} fileContent
 * @returns {undefined | string} gradle version or undefined if not found
 */
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

    return undefined;
}

/**
 * Extracts gradle version using GRADLE_VERSION_REGEX from a given file text.
 *
 * @param {Object} logMeta
 * @param {string} fileContent
 * @returns {undefined | string} gradle version or undefined if not found
 */
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

    return undefined;
}

/**
 * @typedef {Object} ToolConstraint
 * @property {string} source - The source of the tool, e.g., 'gradle'.
 * @property {string} constraint - The constraint associated with the tool.
 * @property {string} toolName - The name of the tool, e.g., 'gradle'.
 */

/**
 * Generates tool constraints based on the Gradle version found in configuration files.
 *
 * @param {Object} logMeta - Metadata for logging purposes.
 * @param {string} [inputFilePath] - Optional path to a file used for testing purposes.
 * @returns {ToolConstraint[]} - An array of tool constraints.
 */
function  getToolConstraints(logMeta, inputFilePath) {
    let gradleVersion;

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

    if (fs.existsSync(wrapperProps)) {
        const props = fs.readFileSync(wrapperProps, "utf8");
        gradleVersion = extractGradleWrapperVersion(logMeta, props ?? '');
        isWrapper = true;
    }

    if (!gradleVersion && fs.existsSync(gradleProps)) {
        const props = fs.readFileSync(gradleProps, "utf8");
        gradleVersion = extractGradleVersion(logMeta, props ?? '');
    }

    if (!gradleVersion && fs.existsSync(buildGradle)) {
        const bg = fs.readFileSync(buildGradle, "utf8");
        gradleVersion = extractGradleVersion(logMeta, bg ?? '');
    }

    if (!gradleVersion) {
        log({ ...logMeta, cwd: process.cwd(), message: "Runinstall: No version found." });
        return [];
    }

    const javaConstraint = getJavaConstraint(gradleVersion)

    const toolConstraints = [];
    toolConstraints.push({source: 'gradle',constraint: javaConstraint, toolName: 'java'});
    if (!isWrapper) {
        toolConstraints.push({source: 'gradle',constraint: gradleVersion, toolName: 'gradle'});
    }

    return toolConstraints;
}

module.exports = {
    getToolConstraints,
};