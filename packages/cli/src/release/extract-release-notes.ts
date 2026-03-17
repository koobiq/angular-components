import { readFileSync } from 'fs';

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
