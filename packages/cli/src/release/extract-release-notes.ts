import { readFileSync } from 'fs';

/**
 * Cli tools automatically set heading with ## or #, so this is the condition to get version tag heading.
 *
 * @param line
 */
const isTagHeading = (line: string): boolean => !!line.match(/^#{1,2}\s+(.*)/);

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
        const isLineWithVersion = isTagHeading(line);

        if (isLineWithVersion && line.includes(versionName)) {
            releaseTitle = line;
            continue;
        }

        if (releaseTitle && isLineWithVersion) break;

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
