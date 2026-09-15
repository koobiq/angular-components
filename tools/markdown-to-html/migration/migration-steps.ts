import { basename } from 'path';

/**
 * Parsing primitives for the migration guide (`docs/guides/migration.{en,ru}.md`).
 *
 * The guide is one ordered upgrade path: an intro, an `### Upgrade plan` list, the numbered steps
 * and an `### After the migration` tail. What the interactive page needs — the release each step
 * lands in — is already written in the guide, so it is read back out of the rendered HTML rather
 * than duplicated in a manifest that would drift.
 */

/** Matches the heading divs `DocsMarkdownRenderer.heading()` emits for an `###`. */
const RENDERED_H3 = /<div id="([^"]*)" class="docs-header-link kbq-markdown__h3">/g;

/** A step heading's id starts with its ordinal, e.g. `7.-удаление-механизма-…`. */
const STEP_NUMBER = /^(\d+)\./;

/** Version spelled by the heading itself, e.g. `### 7. … (21.0.0)` → id ends with `(21.0.0)`. */
const VERSION_IN_ID = /\((\d+\.\d+\.\d+)\)$/;

/**
 * Overrides the version for a step whose visible heading cannot spell an exact one — `(18.6.x)` is
 * not a semver, and `Обновление до Angular 20` names no Koobiq version at all. Authored as a
 * comment so the heading text, and with it the anchor every external link points at, stays put.
 */
const VERSION_OVERRIDE = /<!--\s*migration-step-version\(\s*(\d+\.\d+\.\d+)\s*\)\s*-->/;

/** The directive, for stripping it once it has been read. */
const DIRECTIVES = /<!--\s*migration-step-version\(\s*\d+\.\d+\.\d+\s*\)\s*-->\s*/g;

const MIGRATION_SOURCE = /^migration\.(en|ru)\.md$/;

/** A section of the guide, delimited by the `h3` headings. */
export type DocsMigrationSection = {
    /** The heading's `id` — the anchor the docs site links to. */
    id: string;
    /** Step ordinal, or `null` for the framing sections (upgrade plan, after the migration). */
    number: number | null;
    /** Release the step lands in. Always resolved for a step, always `null` otherwise. */
    version: string | null;
    /** The section's rendered HTML, heading included, directives stripped. */
    html: string;
};

export type DocsMigrationDocument = {
    /** Everything before the first `###` — the `##` title and the intro paragraph. */
    preamble: string;
    sections: DocsMigrationSection[];
};

/** True for the two migration guides, which are the only sources the step transform applies to. */
export const docsIsMigrationSource = (inputPath: string): boolean => MIGRATION_SOURCE.test(basename(inputPath));

/** Splits rendered guide HTML at its `h3` headings. */
export const docsSplitMigrationSections = (html: string): DocsMigrationDocument => {
    const headings = [...html.matchAll(RENDERED_H3)];

    if (!headings.length) {
        return { preamble: html, sections: [] };
    }

    const sections = headings.map((heading, index): DocsMigrationSection => {
        const start = heading.index!;
        const end = headings[index + 1]?.index ?? html.length;
        const body = html.slice(start, end);
        const id = heading[1];
        const numberMatch = id.match(STEP_NUMBER);
        const number = numberMatch ? Number(numberMatch[1]) : null;

        return {
            id,
            number,
            version: number === null ? null : resolveVersion(id, body),
            html: body.replace(DIRECTIVES, '')
        };
    });

    return { preamble: html.slice(0, headings[0].index), sections };
};

/**
 * Names of the schematics referenced by a step, in registry order.
 *
 * Matched on name boundaries rather than as a bare substring: `state-saving-default` is a suffix of
 * `accordion-state-saving-default`, `tree-state-saving-default` and `filter-bar-state-saving-default`,
 * so a plain `includes` credits every one of those steps with a schematic it never mentions.
 */
export const docsFindMigrationSchematics = (html: string, schematicNames: readonly string[]): string[] =>
    schematicNames.filter((name) => new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(html));

/**
 * The release a step lands in: the `<!-- migration-step-version(…) -->` override when the step
 * carries one, otherwise the `(x.y.z)` suffix of its heading. `null` means the guide says nothing,
 * which the transform treats as a build failure rather than shipping an unfilterable step.
 */
const resolveVersion = (id: string, html: string): string | null => {
    const override = html.match(VERSION_OVERRIDE);

    if (override) {
        return override[1];
    }

    const inId = id.match(VERSION_IN_ID);

    return inId ? inId[1] : null;
};
