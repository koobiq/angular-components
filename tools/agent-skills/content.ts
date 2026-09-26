/** Names of the CSS custom properties a stylesheet defines, in order of first definition. */
export const parseTokenNames = (scss: string): string[] => [
    ...new Set([...scss.matchAll(/(--kbq-[a-z0-9-]+)\s*:/g)].map(([, name]) => name))
];

export const renderTokens = (names: string[]): string => [
        'Customize the look by redefining these custom properties instead of the CSS properties of the component. The component declares them on its own `.kbq-*` class, with defaults that point to the global `--kbq-*` design tokens, so set new values in a selector of at least two classes that targets the component element itself (for example `.my-page .kbq-<name>`); a value set on a wrapper alone never reaches it.',
        '',
        '```css',
        ...names,
        '```'
    ].join('\n');

const MAX_PURPOSE_LENGTH = 100;

/** The first sentence of a description, short enough for one row of the component inventory. */
export const firstSentence = (text: string): string => {
    const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
    const clean = sentence
        .replace(/\s+/g, ' ')
        .replace(/\|/g, '/')
        // A tag such as <kbq-code-block> would be read as HTML inside the table.
        .replace(/<[^>]+>/g, (tag) => `\`${tag}\``)
        .trim();

    return clean.length > MAX_PURPOSE_LENGTH ? `${clean.slice(0, MAX_PURPOSE_LENGTH).trimEnd()} ...` : clean;
};

export interface InventoryRow {
    id: string;
    name: string;
    /** Entry point to import from, or `null` for an item with nothing to import. */
    importPath: string | null;
    purpose: string;
}

export const renderInventory = (rows: InventoryRow[]): string => [
        '| id | Import from | What it is |',
        '| --- | --- | --- |',
        ...rows.map(
            ({ id, name, importPath, purpose }) =>
                `| \`${id}\` | ${importPath ? `\`${importPath}\`` : '-'} | ${purpose || name} |`
        )
    ].join('\n');

export interface MigrationEntry {
    name: string;
    version: string;
    description: string;
    /** Whether the collection also registers it for `ng generate`, so it can run on its own. */
    runnable: boolean;
}

const versionKey = (version: string): number[] => version.replace(/-.*$/, '').split('.').map(Number);

const compareVersionsDescending = (a: string, b: string): number => {
    const [left, right] = [versionKey(a), versionKey(b)];

    for (let index = 0; index < Math.max(left.length, right.length); index++) {
        const difference = (right[index] ?? 0) - (left[index] ?? 0);

        if (difference !== 0) return difference;
    }

    return 0;
};

export const renderMigrations = (entries: MigrationEntry[], packageVersion: string): string => {
    const versions = [...new Set(entries.map(({ version }) => version))].sort(compareVersionsDescending);
    const lines = [
        `# Koobiq migrations (@koobiq/components ${packageVersion})`,
        '',
        '`ng update @koobiq/components` runs every migration registered for the versions it crosses. When a migration below covers a deprecated or removed API, run it instead of rewriting the code by hand, then fix only what it reports as needing manual work.',
        ''
    ];

    for (const version of versions) {
        lines.push(`## ${version.replace(/-0$/, '')}`, '');

        for (const entry of entries.filter((candidate) => candidate.version === version)) {
            lines.push(`### \`${entry.name}\``, '', entry.description, '');

            if (entry.runnable) {
                lines.push(`Run on its own: \`ng generate @koobiq/components:${entry.name}\``, '');
            }
        }
    }

    return lines.join('\n').trim();
};
