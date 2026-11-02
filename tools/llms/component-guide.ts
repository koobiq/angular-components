import { DocsStructureItem, DocsStructureItemId } from '../../apps/docs/src/app/structure';
import { compactTables, renderTable, slugify, splitByHeading } from './markdown-text';

/** The guide that maps a task to a component; the MCP server reads it too, with `packages/mcp/src/sources/which-component.ts`. */
export const COMPONENT_GUIDE_PATH = 'docs/guides/which-component-when.en.md';

/** The Russian version of the guide, which the MCP server reads as well: it names the same components. */
export const COMPONENT_GUIDE_RU_PATH = 'docs/guides/which-component-when.ru.md';

/** Where the site serves the guide: the index, and a file per cluster next to it. */
export const COMPONENT_GUIDE_FILE = 'which-component-when.md';

const clusterFile = (slug: string): string => `which-component-when/${slug}.md`;

/** A group of tasks with the components that do them and the neighbors they are confused with. */
export interface GuideCluster {
    title: string;
    slug: string;
    /** The section as Markdown, its tables without padding. */
    body: string;
}

/** One line of the component index: `` - `select` — one or more values from a list… ``. */
export interface GuideComponent {
    /** The names in backticks ahead of the dash: `select`, or both pipes of a line about the highlight pipes. */
    names: string[];
    /** The line as written. */
    line: string;
}

export interface GuideComponentGroup {
    title: string;
    components: GuideComponent[];
}

export interface ComponentGuide {
    clusters: GuideCluster[];
    componentGroups: GuideComponentGroup[];
    /** Words of a request, and the title of the cluster they lead to. */
    keywords: { words: string; cluster: string }[];
}

// The three parts are recognised by the shape of their lines rather than by their titles, the way the MCP server reads
// the guide: the clusters hold table rows, the component index `` - `name` — … `` lines, the keyword index
// `- words → cluster` lines.
const TABLE_ROW = /^\|.*\|$/;
const NAMED_LINE = /^[-*]\s+`[^`]+`.*?\s[—–-]\s/;
const ROUTE_LINE = /^[-*]\s+(?!`)(.+?)\s*→\s*(.+)$/;

interface Part {
    /** Every line of the part, its sections included, trimmed. */
    lines: string[];
    sections: { title: string; body: string }[];
}

/**
 * The `##` part with the most lines of the given shape: a line of the component index may carry a `→` as a keyword
 * line does.
 */
const findPart = (parts: Part[], shape: RegExp, name: string, path: string): Part => {
    const [best] = parts
        .map((part) => ({ part, score: part.lines.filter((line) => shape.test(line)).length }))
        .sort((a, b) => b.score - a.score);

    if (!best?.score) throw new Error(`${path}: no part holds ${name}`);

    return best.part;
};

/** The names in backticks ahead of the dash of a component line. */
const namesOfLine = (line: string): string[] => {
    const head = line.split(/\s[—–-]\s/)[0];

    return [...head.matchAll(/`([^`]+)`/g)].map(([, code]) => code);
};

/**
 * Reads the parts of the guide the documentation for agents is built from. Throws, naming `path`, when one is
 * missing: the skills read the files built from it, and the MCP server reads the same guide.
 */
export const parseComponentGuide = (text: string, path: string = COMPONENT_GUIDE_PATH): ComponentGuide => {
    const parts: Part[] = splitByHeading(text, 2).sections.map(({ body }) => ({
        lines: body.split('\n').map((line) => line.trim()),
        sections: splitByHeading(body, 3).sections
    }));

    const clusters = findPart(parts, TABLE_ROW, 'the clusters', path).sections.map(({ title, body }) => ({
        title,
        slug: slugify(title),
        body: compactTables(body)
    }));

    const componentGroups = findPart(parts, NAMED_LINE, 'the component index', path).sections.map(
        ({ title, body }) => ({
            title,
            components: body
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => /^[-*]\s/.test(line))
                .map((line) => ({ names: NAMED_LINE.test(line) ? namesOfLine(line) : [], line }))
        })
    );

    const keywords = findPart(parts, ROUTE_LINE, 'the keyword index', path).lines.flatMap((line) => {
        const match = ROUTE_LINE.exec(line);

        return match ? [{ words: match[1], cluster: match[2] }] : [];
    });

    return { clusters, componentGroups, keywords };
};

/** Names the guide uses for an item other than the id of its page. */
const GUIDE_ALIASES: Record<string, string> = {
    'kbq-title': DocsStructureItemId.Title,
    kbqHighlightBackground: DocsStructureItemId.Highlight,
    kbqHighlightBold: DocsStructureItemId.Highlight,
    mcHighlight: DocsStructureItemId.Highlight,
    DateFormatter: DocsStructureItemId.DateFormatter,
    ErrorStateMatcher: DocsStructureItemId.Validation
};

/** The item a name of the guide stands for: its id, or what the name is an alias of. */
const resolveGuideName = (name: string): string => GUIDE_ALIASES[name] ?? name;

/** Every name of an item in backticks becomes a link to its Markdown: `` `radio` `` leads to `radio.md`. */
const linkItems = (text: string, urlOf: (id: string) => string | undefined): string =>
    text.replace(/(?<!\[)`([^`\s]+)`/g, (match, name: string) => {
        const url = urlOf(resolveGuideName(name));

        return url ? `[${match}](${url})` : match;
    });

/**
 * The guide as the site serves it to agents: an index of the clusters by the words of a request, with the line of
 * every component, and a file per cluster with its comparisons. Every component it names links to its Markdown.
 */
export const renderComponentGuide = (
    guide: ComponentGuide,
    urlOf: (id: string) => string | undefined,
    siteUrl: (path: string) => string
): Map<string, string> => {
    const clusters = new Map(guide.clusters.map(({ title, slug }) => [title, slug]));
    const clusterLink = (title: string): string => {
        const slug = clusters.get(title);

        if (!slug) throw new Error(`${COMPONENT_GUIDE_PATH}: the keywords lead to "${title}", which has no section`);

        return `[${title}](${siteUrl(clusterFile(slug))})`;
    };
    const index = [
        '# Which component when',
        'Maps a task to a Koobiq component and names the neighbor it is confused with, and why. Find the words of the request in the first table, open the cluster they lead to, then the Markdown of the component it names.',
        '## Clusters',
        renderTable([
            ['Words in the request', 'Cluster'],
            ...guide.keywords.map(({ words, cluster }) => [words, clusterLink(cluster)])
        ]),
        '## Components',
        'One line per component: when to use it. `→` names the neighbor to prefer in the case after it.',
        ...guide.componentGroups.flatMap(({ title, components }) => [
            `### ${title}`,
            linkItems(components.map(({ line }) => line).join('\n'), urlOf)
        ])
    ].join('\n\n');

    return new Map([
        [COMPONENT_GUIDE_FILE, index],
        ...guide.clusters.map(({ title, slug, body }): [string, string] => [
            clusterFile(slug),
            [
                `# ${title}`,
                `A cluster of [Which component when](${siteUrl(COMPONENT_GUIDE_FILE)}).`,
                linkItems(body, urlOf)
            ].join('\n\n')
        ])
    ]);
};

/** A name in the component index that reads like the id of a page: lowercase words joined by hyphens. */
const looksLikeId = (name: string): boolean => /^[a-z]+(-[a-z]+)*$/.test(name);

/**
 * What the guide misses: a component without its line in the component index, and a name there that is the id of no
 * page — a component renamed or removed since the guide was written.
 */
export const findGuideProblems = (
    guide: ComponentGuide,
    components: DocsStructureItem[],
    knownIds: ReadonlySet<string>
): string[] => {
    const names = guide.componentGroups.flatMap(({ components: lines }) => lines.flatMap(({ names: of }) => of));
    const named = new Set(names.map(resolveGuideName));
    const missing = components
        .filter(({ id }) => !named.has(id))
        .map(({ id }) => `the component "${id}" has no line in the component index`);
    const unknown = names
        .filter((name) => looksLikeId(name) && !knownIds.has(resolveGuideName(name)))
        .map((name) => `"${name}" in the component index is the id of no page`);

    return [...missing, ...unknown];
};
