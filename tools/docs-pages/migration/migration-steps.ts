import { toString } from 'mdast-util-to-string';
import { basename } from 'path';
import type { CompiledBlock } from '../compile-page';

/**
 * Parsing primitives for the migration guide (`docs/guides/migration.{en,ru}.mdx`).
 *
 * The guide is one ordered upgrade path: an intro, an `### Upgrade plan` list, the steps and an
 * `### After the migration` tail. What the interactive page needs — the release each step lands
 * in and the components it concerns — is already written in the guide, in its headings and in the
 * MDX comments it carries for the tools, so it is read from the compiled page rather than
 * duplicated in a manifest that would drift.
 */

/** The id the compiler gives a heading, read from the template the heading compiles to. */
const HEADING_ID = /^<h\d id="([^"]*)"/;

/** Version spelled by the heading itself, e.g. `### … (21.0.0)` → id ends with `(21.0.0)`. */
const VERSION_IN_ID = /\((\d+\.\d+\.\d+)\)$/;

// A directive is an MDX comment on a line of its own, `{/* migration-step-version(18.6.0) */}`;
// the expressions below match the text between its delimiters.

/**
 * Overrides the version for a step whose visible heading cannot spell an exact one — `(18.6.x)` is
 * not a semver, and `Обновление до Angular 20` names no Koobiq version at all. Authored as a
 * comment so the heading text, and with it the anchor every external link points at, stays put.
 */
const VERSION_OVERRIDE = /^migration-step-version\(\s*(\d+\.\d+\.\d+)\s*\)$/;

/**
 * The components a step concerns, as docs item ids: `migration-step-components(button, button-group)`.
 * A step without one concerns every project and is never filtered by component.
 */
const STEP_COMPONENTS = /^migration-step-components\(([^)]*)\)$/;

/** Marks a step made of `####` subsections that each concern the components the subsection names. */
const COMPONENT_SUBSECTIONS = /^migration-component-subsections$/;

/**
 * Names a subsection's components where its heading's slug is not a docs id, or not the only one:
 * `migration-subsection-components(tag, tag-list)`.
 */
const SUBSECTION_COMPONENTS = /^migration-subsection-components\(([^)]*)\)$/;

const DIRECTIVES = [VERSION_OVERRIDE, STEP_COMPONENTS, COMPONENT_SUBSECTIONS, SUBSECTION_COMPONENTS];

const MIGRATION_SOURCE = /^migration\.(en|ru)\.mdx$/;

/** A section of the guide, delimited by the `###` headings. */
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
    /** The section's blocks, heading first. */
    blocks: CompiledBlock[];
};

export type DocsMigrationSubsections = {
    /** Everything ahead of the first subsection, the step's heading included. */
    intro: CompiledBlock[];
    /** Each subsection with the docs item ids of the components it concerns. */
    items: { components: string[]; blocks: CompiledBlock[] }[];
};

export type DocsMigrationDocument = {
    /** Everything before the first `###` — the `##` title and the intro paragraph. */
    preamble: CompiledBlock[];
    sections: DocsMigrationSection[];
};

/** True for the two migration guides, which are the only pages laid out into steps. */
export const docsIsMigrationSource = (inputPath: string): boolean => MIGRATION_SOURCE.test(basename(inputPath));

/** The template of the blocks, one per line. A comment compiles to nothing and takes no line. */
export const docsJoinMigrationBlocks = (blocks: readonly CompiledBlock[]): string =>
    blocks
        .map(({ template }) => template)
        .filter(Boolean)
        .join('\n');

/** The text of a comment that is a directive of the guide, or `null` for any other block. */
const readDirective = ({ node }: CompiledBlock): string | null =>
    node.type === 'mdxFlowExpression'
        ? (node.value.match(/^\s*\/\*\s*(migration-[\s\S]*?)\s*\*\/\s*$/)?.[1] ?? null)
        : null;

/** Directives the guide spells that none of the known ones matches: a typo would otherwise do nothing at all. */
export const docsFindUnknownMigrationDirectives = (blocks: readonly CompiledBlock[]): string[] =>
    blocks
        .map(readDirective)
        .filter((directive): directive is string => !!directive && !DIRECTIVES.some((known) => known.test(directive)));

/** Splits the compiled guide at its `###` headings. */
export const docsSplitMigrationSections = (blocks: readonly CompiledBlock[]): DocsMigrationDocument => {
    const { head, groups } = splitAt(blocks, 3);

    return {
        preamble: head,
        sections: groups.map((section): DocsMigrationSection => {
            const id = headingIdOf(section);

            return {
                id,
                version: readArgument(section, VERSION_OVERRIDE) ?? id.match(VERSION_IN_ID)?.[1] ?? null,
                components: readComponents(section, STEP_COMPONENTS) ?? [],
                subsections: readArgument(section, COMPONENT_SUBSECTIONS) === null ? null : splitSubsections(section),
                blocks: section
            };
        })
    };
};

/**
 * Names of the schematics referenced by a step, in registry order. Read from the text of the blocks
 * rather than their template, which binds code blocks by index and so never holds a command.
 *
 * Matched on name boundaries rather than as a bare substring: `state-saving-default` is a suffix of
 * `accordion-state-saving-default`, `tree-state-saving-default` and `filter-bar-state-saving-default`,
 * so a plain `includes` credits every one of those steps with a schematic it never mentions.
 */
export const docsFindMigrationSchematics = (
    blocks: readonly CompiledBlock[],
    schematicNames: readonly string[]
): string[] => {
    const text = blocks.map(({ node }) => toString(node)).join('\n');

    return schematicNames.filter((name) => new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(text));
};

/** Splits blocks ahead of each heading of the depth; the blocks before the first one come back as `head`. */
const splitAt = (blocks: readonly CompiledBlock[], depth: number) => {
    const head: CompiledBlock[] = [];
    const groups: CompiledBlock[][] = [];

    for (const block of blocks) {
        if (block.node.type === 'heading' && block.node.depth === depth) {
            groups.push([block]);
        } else {
            (groups.at(-1) ?? head).push(block);
        }
    }

    return { head, groups };
};

/** Splits a step at its `####` headings. */
const splitSubsections = (blocks: readonly CompiledBlock[]): DocsMigrationSubsections => {
    const { head, groups } = splitAt(blocks, 4);

    return {
        intro: head,
        items: groups.map((subsection) => ({
            components: readComponents(subsection, SUBSECTION_COMPONENTS) ?? [headingIdOf(subsection)],
            blocks: subsection
        }))
    };
};

const headingIdOf = ([heading]: readonly CompiledBlock[]): string => heading.template.match(HEADING_ID)?.[1] ?? '';

/** The argument of the first directive the expression matches, `''` for one that takes none, or `null`. */
const readArgument = (blocks: readonly CompiledBlock[], directive: RegExp): string | null => {
    for (const block of blocks) {
        const match = readDirective(block)?.match(directive);

        if (match) return match[1] ?? '';
    }

    return null;
};

/** The ids a components directive lists, or `null` where there is no such directive. */
const readComponents = (blocks: readonly CompiledBlock[], directive: RegExp): string[] | null =>
    readArgument(blocks, directive)
        ?.split(',')
        .map((component) => component.trim())
        .filter(Boolean) ?? null;
