import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CHANGELOG_FILE_NAME } from './constants';

/** Matches a changelog heading and captures its version, e.g. `# 1.2.3-rc.1 (2024-11-29)`. */
const VERSION_HEADING_PATTERN = /^#*\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\s*\(\d{4}-\d{2}-\d{2}\)/;

/**
 * Condition to get version tag heading X.Y.Z (YYYY-MM-DD).
 *
 * @param line
 */
const isVersionLine = (line: string): boolean => VERSION_HEADING_PATTERN.test(line);

/** Whether `line` is a changelog heading for exactly `versionName` (not a substring match). */
const isHeadingForVersion = (line: string, versionName: string): boolean => {
    const match = VERSION_HEADING_PATTERN.exec(line);

    return match !== null && match[1] === versionName;
};

/**
 * Represents the extracted release notes and title for a specific version from a changelog.
 *
 * @property releaseNotes - The content of the release notes between the current and previous version headings.
 * @property releaseTitle - The heading text from changelog associated with the release version and date.
 */
export type ChangelogReleaseNotes = { releaseNotes: string; releaseTitle: string };

/**
 * Extracts the release notes for a specific release from a given changelog file.
 * @see ChangelogReleaseNotes
 */
export function extractReleaseNotes(changelogPath: string, versionName: string): ChangelogReleaseNotes | null {
    const changelogContent = readFileSync(changelogPath, 'utf8');
    const lines = changelogContent.split('\n');

    let releaseTitle = '';
    let releaseNotes = '';

    for (const line of lines) {
        const isLineWithReleaseVersion = isVersionLine(line);

        if (releaseTitle) {
            if (isLineWithReleaseVersion) break;

            releaseNotes += `${line}\n`;
            continue;
        }

        if (isLineWithReleaseVersion && isHeadingForVersion(line, versionName)) {
            releaseTitle = line;
        }
    }

    if (!releaseTitle) return null;

    return {
        releaseNotes,
        releaseTitle
    } satisfies ChangelogReleaseNotes;
}

/**
 * A release tag split into its optional project scope and version.
 *
 * @property project - The project name for an independently-versioned release, or `null` for a
 * single-project / fixed-group release.
 * @property version - The Semver version portion of the tag.
 */
export type ParsedTag = { project: string | null; version: string };

/**
 * Splits a release tag into its optional project scope and version.
 *
 * Supports both a plain `{version}` tag (single-project or fixed-group releases) and a
 * `{projectName}@{version}` tag (Nx's independent-release tag pattern, e.g.
 * `ag-grid-angular-theme@34.5.1`), so the same tag can drive changelog extraction across
 * monorepos using either convention.
 *
 * @param tag
 */
export function parseTag(tag: string): ParsedTag {
    const at = tag.lastIndexOf('@');

    if (at <= 0) {
        return { project: null, version: at === -1 ? tag : tag.slice(at + 1) };
    }

    return { project: tag.slice(0, at), version: tag.slice(at + 1) };
}

/** Matches a plain path segment: no `/`, no `..`, no leading `.`. */
const SAFE_PROJECT_DIR_NAME = /^[^./][^/]*$/;

/**
 * Resolves which changelog file to read for a parsed tag: the workspace root changelog for an
 * unscoped tag, or a project's own changelog (`packages/{project}/CHANGELOG.md`) for a scoped
 * tag, with the tag's npm scope (`@scope/`) stripped since packages live under their bare name.
 *
 * @param workspaceRoot
 * @param parsedTag
 * @throws if the tag is scoped but no changelog exists for that project
 * @see parseTag
 */
export function resolveChangelogPath(workspaceRoot: string, { project }: ParsedTag): string {
    if (project === null) {
        return join(workspaceRoot, CHANGELOG_FILE_NAME);
    }

    const projectDirName = project.replace(/^@[^/]+\//, '');

    if (!SAFE_PROJECT_DIR_NAME.test(projectDirName)) {
        throw new Error(`Invalid project name in release tag: "${project}"`);
    }

    const projectChangelog = join(workspaceRoot, 'packages', projectDirName, CHANGELOG_FILE_NAME);

    if (!existsSync(projectChangelog)) {
        throw new Error(`No changelog found for project "${project}" at ${projectChangelog}`);
    }

    return projectChangelog;
}
