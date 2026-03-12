import { readFileSync } from 'fs';
import { marked, Token, Tokens } from 'marked';

const isTagHeading = (item: Token): item is Tokens.Heading => item.type === 'heading' && item.depth <= 2;

/** Extracts the release notes for a specific release from a given changelog file. */
export function extractReleaseNotes(changelogPath: string, versionName: string): any {
    const changelogContent = readFileSync(changelogPath, 'utf8');

    const parsedChangelogItems = marked.Lexer.lex(changelogContent);

    const currentVersionIndex = parsedChangelogItems.findIndex(
        (item: Token) => isTagHeading(item) && item.text.includes(versionName)
    );
    const previousVersionIndex = parsedChangelogItems.slice(currentVersionIndex + 1).findIndex(isTagHeading);

    if (!currentVersionIndex && !previousVersionIndex) return null;

    // merge all data between two versions
    const releaseNotes = parsedChangelogItems
        .slice(currentVersionIndex + 1, previousVersionIndex)
        .map((item) => item.raw)
        .join('');

    const releaseTitle = (parsedChangelogItems[currentVersionIndex] as Tokens.Heading).text;

    return {
        releaseNotes,
        releaseTitle
    };
}
