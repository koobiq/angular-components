import { readFileSync } from 'fs';

/** Extracts the release notes for a specific release from a given changelog file. */
export function extractReleaseNotes(changelogPath: string, versionName: string): any {
    const changelogContent = readFileSync(changelogPath, 'utf8');
    const escapedVersion = versionName.replace(new RegExp('\\.', 'g'), '\\.');

    // Regular expression that matches the release notes for the given version.
    const releaseNotesRegex = new RegExp(
        `##? (${escapedVersion} \\(\\d{4}-\\d{2}-\\d{2}\\)\n\n### .+?)\n\n([\\s\\S]*?)(?=\n##? )`
    );

    const matches = releaseNotesRegex.exec(changelogContent);

    return matches
        ? {
              releaseTitle: matches[1],
              releaseNotes: matches[2]
          }
        : null;
}
