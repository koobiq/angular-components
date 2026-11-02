import { globSync } from 'glob';
import {
    docsGetItemById,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId
} from '../../apps/docs/src/app/structure';
import { shiftHeadings } from './markdown-text';
import { addFile, markdownLink, splitSections } from './site-files';
import { getMarkdownUrl, getSectionPath, getSiteUrl, readRepoFile, resolveSiteUrl } from './sources';

const MIGRATIONS_PATH = 'packages/schematics/src/migrations.json';

/** The full lists of breaking changes the migration guide refers to, one per major version of Angular, newest first. */
const findBreakingChanges = (): { angular: string; path: string }[] =>
    globSync('docs/guides/angular-*-breaking-changes.en.md', { posix: true })
        .map((path) => ({ angular: /angular-(\d+)-/.exec(path)![1], path }))
        .sort((a, b) => Number(b.angular) - Number(a.angular));

const getBreakingChangesPath = (migration: DocsStructureItem, angular: string): string =>
    getSectionPath(migration, [`angular-${angular}-breaking-changes`]);

/** A list of breaking changes as GitHub shows it, in the copy of a branch rather than of the version the site documents. */
const BREAKING_CHANGES_ON_GITHUB =
    /^https:\/\/github\.com\/koobiq\/angular-components\/blob\/[^/]+\/docs\/guides\/angular-(\d+)-breaking-changes\.en\.md(#.*)?$/;

/** The copy of a list of breaking changes the site serves, for a link of a page to it on GitHub; `null` for any other. */
export const resolveBreakingChangesUrl = (url: string): string | null => {
    const match = BREAKING_CHANGES_ON_GITHUB.exec(url);

    if (!match || !findBreakingChanges().some(({ angular }) => angular === match[1])) return null;

    const migration = docsGetItemById(DocsStructureItemId.Migration, DocsStructureCategoryId.Main)!;

    return `${getSiteUrl(getBreakingChangesPath(migration, match[1]))}${match[2] ?? ''}`;
};

interface Migration {
    version: string;
    description: string;
}

// A span of code is matched first; a tag or a generic type outside one, with the name around it, becomes one:
// `<kbq-alert>`, `Signal<T>`, `KBQ_<X>_CONFIGURATION`.
const CODE_SPAN_OR_TAG = /(`+)[^`]*?\1|[\w.-]*<[^<>\n]+>[\w-]*(?:\[\])?/g;

/** The description of a migration is plain text: the tags and the generic types in it are code to a Markdown reader. */
const markCode = (text: string): string =>
    text.replace(CODE_SPAN_OR_TAG, (match, fence?: string) => (fence ? match : `\`${match}\``));

/** `21.0.0-0`, the version a migration runs from, is the release `21.0.0` to a reader. */
const releaseOf = (version: string): string => version.replace(/-\d+$/, '');

const compareVersions = (a: string, b: string): number => {
    const [left, right] = [a, b].map((version) => version.split('.').map(Number));

    return left.reduce((result, part, index) => result || part - right[index], 0);
};

const renderMigrations = (item: DocsStructureItem): string => {
    const { schematics } = JSON.parse(readRepoFile(MIGRATIONS_PATH)) as { schematics: Record<string, Migration> };
    const byRelease = new Map<string, string[]>();

    for (const [name, { version, description }] of Object.entries(schematics)) {
        const release = releaseOf(version);

        byRelease.set(release, [...(byRelease.get(release) ?? []), `- \`${name}\`: ${markCode(description.trim())}`]);
    }

    return [
        '# ng update migrations',
        `\`ng update @koobiq/components\` runs every migration of a release newer than the installed one. A migration rewrites what it can and prints a warning for the rest; ${markdownLink(item.name.en, getMarkdownUrl(item))} has the manual steps.`,
        ...[...byRelease]
            .sort(([a], [b]) => compareVersions(b, a))
            .flatMap(([release, lines]) => [`## ${release}`, lines.join('\n')])
    ].join('\n\n');
};

/** A site link of a plain Markdown file, which the site never compiles: the same treatment the pages get. */
const resolveLinks = (text: string): string =>
    text.replace(/\]\((\/[^)\s]*)\)/g, (_match, url: string) => `](${resolveSiteUrl(url)})`);

/**
 * The files the migration guide has besides its sections: the migrations `ng update` runs, from `migrations.json`, by
 * release when too long for one file, and the full lists of breaking changes. Returns the section of the guide that
 * links them.
 */
export const renderMigrationExtras = (item: DocsStructureItem, files: Map<string, string>): string => {
    const guideLink = markdownLink(item.name.en, getMarkdownUrl(item));
    const migrations = getSectionPath(item, ['ng-update-migrations']);
    const migrationsLink = markdownLink('ng update migrations', getSiteUrl(migrations));
    const links = [`- ${migrationsLink}: every migration by the release it ships in`];

    addFile(
        files,
        migrations,
        splitSections(
            renderMigrations(item),
            { path: migrations.replace(/\.md$/, ''), link: `${migrationsLink} in ${guideLink}` },
            files
        )
    );

    for (const { angular, path } of findBreakingChanges()) {
        const target = getBreakingChangesPath(item, angular);

        addFile(
            files,
            target,
            `# Angular ${angular} breaking changes\n\n${shiftHeadings(resolveLinks(readRepoFile(path).trim()), -1)}`
        );
        links.push(`- ${markdownLink(`Angular ${angular} breaking changes`, getSiteUrl(target))}`);
    }

    return `## See also\n\n${links.join('\n')}`;
};
