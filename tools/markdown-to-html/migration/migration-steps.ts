import { basename } from 'path';

/**
 * Parsing primitives for the migration guide (`docs/guides/migration.{en,ru}.md`).
 *
 * The guide is one ordered upgrade path: an intro, an `### Upgrade plan` list, the steps and an
 * `### After the migration` tail. What the interactive page needs — the release each step lands
 * in — is already written in the guide, so it is read back out of the rendered HTML rather than
 * duplicated in a manifest that would drift.
 */

/** Matches the heading divs `DocsMarkdownRenderer.heading()` emits for an `###`. */
const RENDERED_H3 = /<div id="([^"]*)" class="docs-header-link kbq-markdown__h3">/g;

/** The same for an `####`. */
const RENDERED_H4 = /<div id="([^"]*)" class="docs-header-link kbq-markdown__h4">/g;

/** Version spelled by the heading itself, e.g. `### … (21.0.0)` → id ends with `(21.0.0)`. */
const VERSION_IN_ID = /\((\d+\.\d+\.\d+)\)$/;

/**
 * Overrides the version for a step whose visible heading cannot spell an exact one — `(18.6.x)` is
 * not a semver, and `Обновление до Angular 20` names no Koobiq version at all. Authored as a
 * comment so the heading text, and with it the anchor every external link points at, stays put.
 */
const VERSION_OVERRIDE = /<!--\s*migration-step-version\(\s*(\d+\.\d+\.\d+)\s*\)\s*-->/;

/**
 * The components a step concerns, as docs item ids: `<!-- migration-step-components(button, button-group) -->`.
 * A step without one concerns every project and is never filtered by component.
 */
const STEP_COMPONENTS = /<!--\s*migration-step-components\(([^)]*)\)\s*-->/;

/** Marks a step made of `####` subsections that each concern the components the subsection names. */
const COMPONENT_SUBSECTIONS = /<!--\s*migration-component-subsections\s*-->/;

/**
 * Names a subsection's components where its heading's slug is not a docs id, or not the only one:
 * `<!-- migration-subsection-components(tag, tag-list) -->`.
 */
const SUBSECTION_COMPONENTS = /<!--\s*migration-subsection-components\(([^)]*)\)\s*-->/;

/** Every directive, for stripping once read. */
const DIRECTIVES =
    /<!--\s*migration-(?:step-version|step-components|component-subsections|subsection-components)\b[^>]*-->\s*/g;

const MIGRATION_SOURCE = /^migration\.(en|ru)\.md$/;

/** A section of the guide, delimited by the `h3` headings. */
export type DocsMigrationSection = {
    /** The heading's `id` — the anchor the docs site links to. */
    id: string;
    /**
     * Release the step lands in, and what makes the section a step at all: the framing sections —
     * the upgrade plan and the closing note — name none.
     */
    version: string | null;
    /** Docs item ids of the components the step concerns; empty for a step every project goes through. */
    components: string[];
    /** The step split at its per-component subsections, or `null` for a step that is not made of them. */
    subsections: DocsMigrationSubsections | null;
    /** The section's rendered HTML, heading included, directives stripped. */
    html: string;
};

export type DocsMigrationSubsections = {
    /** Everything ahead of the first subsection, the step's heading included. */
    intro: string;
    /** Each subsection with the docs item ids of the components it concerns. */
    items: { components: string[]; html: string }[];
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

        return {
            id,
            version: resolveVersion(id, body),
            components: readComponents(body, STEP_COMPONENTS) ?? [],
            subsections: COMPONENT_SUBSECTIONS.test(body) ? splitSubsections(body) : null,
            html: stripDirectives(body)
        };
    });

    return { preamble: html.slice(0, headings[0].index), sections };
};

const stripDirectives = (html: string): string => html.replace(DIRECTIVES, '');

/** The ids a components directive lists, or `null` where there is no such directive. */
const readComponents = (html: string, directive: RegExp): string[] | null =>
    html
        .match(directive)?.[1]
        .split(',')
        .map((component) => component.trim())
        .filter(Boolean) ?? null;

/** Splits a step at its `####` headings; read before the directives are stripped, for the overrides. */
const splitSubsections = (html: string): DocsMigrationSubsections => {
    const headings = [...html.matchAll(RENDERED_H4)];

    return {
        intro: stripDirectives(html.slice(0, headings[0]?.index ?? html.length)),
        items: headings.map((heading, index) => {
            const body = html.slice(heading.index, headings[index + 1]?.index ?? html.length);

            return {
                components: readComponents(body, SUBSECTION_COMPONENTS) ?? [heading[1]],
                html: stripDirectives(body)
            };
        })
    };
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
 * carries one, otherwise the `(x.y.z)` suffix of its heading. `null` is the guide's framing, and
 * anywhere else a build failure rather than a step that quietly stopped being filterable.
 */
const resolveVersion = (id: string, html: string): string | null => {
    const override = html.match(VERSION_OVERRIDE);

    if (override) {
        return override[1];
    }

    const inId = id.match(VERSION_IN_ID);

    return inId ? inId[1] : null;
};
