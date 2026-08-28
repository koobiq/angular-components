import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CHANGELOG_FILE_NAME } from './constants';

/**
 * Condition to get version tag heading X.Y.Z (YYYY-MM-DD).
 *
 * @param line
 */
export const isVersionLine = (line: string): boolean => /\d+\.\d+\.\d+.*\(\d{4}-\d{2}-\d{2}\)/.test(line);

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

        if (isLineWithReleaseVersion && line.includes(versionName)) {
            releaseTitle = line;
            continue;
        }

        if (releaseTitle && isLineWithReleaseVersion) break;

        if (releaseTitle) {
            releaseNotes += `${line}\n`;
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

    if (at === -1) {
        return { project: null, version: tag };
    }

    return { project: tag.slice(0, at), version: tag.slice(at + 1) };
}

/**
 * Resolves which changelog file to read for a parsed tag: a project's own changelog
 * (`packages/{project}/CHANGELOG.md`) for a scoped tag, falling back to the workspace root
 * changelog when there's no project scope, or no changelog exists for that project.
 *
 * @param workspaceRoot
 * @param parsedTag
 * @see parseTag
 */
export function resolveChangelogPath(workspaceRoot: string, { project }: ParsedTag): string {
    if (project) {
        const projectChangelog = join(workspaceRoot, 'packages', project, CHANGELOG_FILE_NAME);

        if (existsSync(projectChangelog)) {
            return projectChangelog;
        }
    }

    return join(workspaceRoot, CHANGELOG_FILE_NAME);
}
