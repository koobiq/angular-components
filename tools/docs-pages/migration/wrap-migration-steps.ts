import type { CompiledBlock } from '../compile-page';
import {
    DocsMigrationSection,
    docsFindUnknownMigrationDirectives,
    docsJoinMigrationBlocks,
    docsSplitMigrationSections
} from './migration-steps';

/**
 * Lays the migration guide out into sections, each step carrying the release it lands in and the
 * components it concerns, so the docs page can hide the steps outside the range and the components
 * the reader picked. Everything the filter reads travels in these attributes; there is no second
 * artifact to keep in sync.
 */

/** Matches the `<li` of the upgrade-plan list, so each item can be tagged with its step. */
const PLAN_ITEM = /<li(\s|>)/g;

/**
 * The document's `h2`, which opens the preamble. It names the release the whole guide starts from
 * ("How to upgrade from Koobiq 17"), so the page renames it after the upgrade the reader picked.
 */
const TITLE_HEADING = /<h2 id="[^"]*" class="docs-header-link kbq-markdown__h2"/;

/** Carried by every section, step or not, so one rule can space them all. */
export const DOCS_MIGRATION_SECTION_CLASS = 'docs-migration-section';

export const DOCS_MIGRATION_STEP_CLASS = 'docs-migration-step';

/**
 * The intro, the upgrade plan and the closing note: no step of their own, shown only while some step
 * is.
 */
export const DOCS_MIGRATION_FRAMING_CLASS = 'docs-migration-framing';

/** The document's title and lead-in, ahead of the first section. */
export const DOCS_MIGRATION_INTRO_CLASS = 'docs-migration-intro';

/** A subsection of a step made of them, tagged with its components the way a step is. */
export const DOCS_MIGRATION_COMPONENT_CLASS = 'docs-migration-component';

/** The `layout` that `compilePage` lays the migration guide at `path` out with. */
export const docsMigrationGuideLayout =
    (path: string) =>
    (blocks: CompiledBlock[]): string => {
        const { preamble, sections } = docsSplitMigrationSections(blocks);

        if (!sections.length) {
            throw new Error(`${path}: no "###" sections found — the migration guide layout changed.`);
        }

        const unknown = docsFindUnknownMigrationDirectives(blocks);

        if (unknown.length) {
            throw new Error(`${path}: unknown directive(s) ${unknown.join(', ')}.`);
        }

        // Naming a release is what makes a section a step, so a step that forgot to would quietly
        // stop being filterable. Only the guide's framing may omit one, and it opens and closes the
        // document: the upgrade plan above the steps, the closing note below them.
        const misfiled = sections
            .slice(1, -1)
            .filter(({ version }) => !version)
            .map(({ id }) => id);

        if (misfiled.length) {
            throw new Error(
                `${path}: no release for section(s) ${misfiled.join(', ')}. ` +
                    'Spell it in the heading as "(x.y.z)", or add "{/* migration-step-version(x.y.z) */}" below it.'
            );
        }

        const unsplit = sections
            .filter(({ subsections }) => subsections && !subsections.items.length)
            .map(({ id }) => id);

        if (unsplit.length) {
            throw new Error(
                `${path}: no "####" subsections in ${unsplit.join(', ')}, which is marked as made of them.`
            );
        }

        const stepIds = sections.filter(({ version }) => version).map(({ id }) => id);

        return [
            renderIntro(preamble),
            ...sections.map((section, index) =>
                section.version === null
                    ? renderFraming(
                          index === 0
                              ? tagPlanList(docsJoinMigrationBlocks(section.blocks), stepIds)
                              : docsJoinMigrationBlocks(section.blocks)
                      )
                    : renderStep(section)
            )
        ]
            .filter(Boolean)
            .join('\n');
    };

/**
 * Framing like the plan, so the page drops it the same way, but without the section spacing: it
 * opens the document.
 */
const renderIntro = (blocks: readonly CompiledBlock[]): string => {
    const template = docsJoinMigrationBlocks(blocks);

    return template
        ? `<section class="${DOCS_MIGRATION_FRAMING_CLASS} ${DOCS_MIGRATION_INTRO_CLASS}">` +
              `${template.replace(TITLE_HEADING, '$& data-docs-migration-title')}</section>`
        : '';
};

/** A step carries an empty host right under its heading, where the page mounts the reader's "done" mark. */
const renderStep = ({ version, components, subsections, blocks }: DocsMigrationSection): string => {
    const [heading, ...body] = subsections ? subsections.intro : blocks;
    const content = [
        heading.template,
        '<div data-docs-migration-done></div>',
        docsJoinMigrationBlocks(body),
        ...(subsections?.items ?? []).map(
            (item) =>
                `<div class="${DOCS_MIGRATION_COMPONENT_CLASS}" data-docs-migration-components="${item.components.join(' ')}">` +
                `${docsJoinMigrationBlocks(item.blocks)}</div>`
        )
    ];

    return (
        `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_STEP_CLASS}"` +
        ` data-docs-migration-version="${version}"` +
        (components.length ? ` data-docs-migration-components="${components.join(' ')}"` : '') +
        `>${content.filter(Boolean).join('\n')}</section>`
    );
};

/**
 * Wrapped like a step, minus the release. Both so the heading spacing rule can be written once for
 * every section, and so the page can drop the plan and the closing note while no step is shown —
 * an empty plan under "nothing to upgrade" reads as a broken page.
 */
const renderFraming = (template: string): string =>
    `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_FRAMING_CLASS}">${template}</section>`;

/**
 * Tags the upgrade-plan list items with the step each one points at, by the id of its heading, so
 * the plan filters alongside the body instead of promising steps that are no longer shown. The items
 * are tagged by position: a spec asserts the list has exactly one item per step.
 */
const tagPlanList = (template: string, stepIds: readonly string[]): string => {
    let index = 0;

    return template.replace(PLAN_ITEM, (match, tail: string) => {
        const id = stepIds[index++];

        return id === undefined ? match : `<li data-docs-migration-step="${id}"${tail}`;
    });
};
