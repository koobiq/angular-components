import { readFileSync } from 'fs';
import { marked, Token, Tokens } from 'marked';

/**
 * Cli tools automatically set heading with ## or #, so this is the condition to get version tag heading.
 *
 * @param item
 */
const isTagHeading = (item: Token): item is Tokens.Heading => item.type === 'heading' && item.depth <= 2;

/**
 * Represents the extracted release notes and title for a specific version from a changelog.
 *
 * @property releaseNotes - The content of the release notes between the current and previous version headings.
 * @property releaseTitle - The heading text associated with the release version.
 */
export type ChangelogReleaseNotes = { releaseNotes: string; releaseTitle: string };

/** Extracts the release notes for a specific release from a given changelog file. */
export function extractReleaseNotes(changelogPath: string, versionName: string): ChangelogReleaseNotes | null {
    const changelogContent = readFileSync(changelogPath, 'utf8');

    const parsedChangelogItems = marked.Lexer.lex(changelogContent);

    const currentVersionIndex = parsedChangelogItems.findIndex(
        (item: Token) => isTagHeading(item) && item.text.includes(versionName)
    );

    if (currentVersionIndex === -1) return null;

    let previousVersionIndex = parsedChangelogItems.findIndex(
        (item, index) => isTagHeading(item) && index > currentVersionIndex
    );

    previousVersionIndex = previousVersionIndex === -1 ? parsedChangelogItems.length : previousVersionIndex;

    // merge all data between two versions
    const releaseNotes = parsedChangelogItems
        .slice(currentVersionIndex + 1, previousVersionIndex)
        .map((item) => item.raw)
        .join('');

    const releaseTitle = (parsedChangelogItems[currentVersionIndex] as Tokens.Heading).text;

    return {
        releaseNotes,
        releaseTitle
    } satisfies ChangelogReleaseNotes;
}
