import type { DocsHtmlTransform } from '../utils';
import { DocsMigrationSection, docsIsMigrationSource, docsSplitMigrationSections } from './migration-steps';

/**
 * Wraps every step of the migration guide in a `<section>` carrying the release it lands in and the
 * components it concerns, so the docs page can hide the steps outside the range and the components
 * the reader picked. Everything the filter reads travels in these attributes; there is no second
 * artifact to keep in sync.
 *
 * Runs after `finalizeOutput`, on exactly the bytes that ship, and is a no-op for every source
 * except the two migration guides.
 */

/** Matches the `<li` of the upgrade-plan list, so each item can be tagged with its step. */
const PLAN_ITEM = /<li(\s|>)/g;

/**
 * The document's `h2`, which opens the preamble. It names the release the whole guide starts from
 * ("How to upgrade from Koobiq 17"), so the page renames it after the upgrade the reader picked.
 */
const TITLE_HEADING = /<div id="[^"]*" class="docs-header-link kbq-markdown__h2"/;

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

/** A subsection of a step made of them, concerning one component. */
export const DOCS_MIGRATION_COMPONENT_CLASS = 'docs-migration-component';

export const docsCreateMigrationStepsTransform = (): DocsHtmlTransform => {
    return (html: string, inputPath: string): string => {
        if (!docsIsMigrationSource(inputPath)) {
            return html;
        }

        const { preamble, sections } = docsSplitMigrationSections(html);

        if (!sections.length) {
            throw new Error(`${inputPath}: no "###" sections found — the migration guide layout changed.`);
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
                `${inputPath}: no release for section(s) ${misfiled.join(', ')}. ` +
                    'Spell it in the heading as "(x.y.z)", or add "<!-- migration-step-version(x.y.z) -->" below it.'
            );
        }

        const unsplit = sections
            .filter(({ subsections }) => subsections && !subsections.items.length)
            .map(({ id }) => id);

        if (unsplit.length) {
            throw new Error(
                `${inputPath}: no "####" subsections in ${unsplit.join(', ')}, which is marked as made of them.`
            );
        }

        const stepIds = sections.filter(({ version }) => version).map(({ id }) => id);

        return (
            renderIntro(preamble) +
            sections
                .map((section, index) =>
                    section.version === null
                        ? renderFraming(index === 0 ? tagPlanList(section.html, stepIds) : section.html)
                        : renderStep(section)
                )
                .join('')
        );
    };
};

/**
 * Framing like the plan, so the page drops it the same way, but without the section spacing: it
 * opens the document.
 */
const renderIntro = (html: string): string =>
    html.trim()
        ? `<section class="${DOCS_MIGRATION_FRAMING_CLASS} ${DOCS_MIGRATION_INTRO_CLASS}">` +
          `${html.replace(TITLE_HEADING, '$& data-docs-migration-title')}</section>`
        : html;

/**
 * A step carries an empty host right under its heading, where the page mounts the reader's "done"
 * mark. The heading is the section's first element and holds no `div` of its own, so the first
 * closing tag is its end.
 */
const renderStep = ({ version, components, subsections, html }: DocsMigrationSection): string => {
    const body = subsections
        ? subsections.intro +
          subsections.items
              .map(
                  (item) =>
                      `<div class="${DOCS_MIGRATION_COMPONENT_CLASS}" data-docs-migration-component="${item.component}">` +
                      `${item.html}</div>`
              )
              .join('')
        : html;

    return (
        `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_STEP_CLASS}"` +
        ` data-docs-migration-version="${version}"` +
        (components.length ? ` data-docs-migration-components="${components.join(' ')}"` : '') +
        `>${body.replace('</div>', '</div><div data-docs-migration-done></div>')}</section>`
    );
};

/**
 * Wrapped like a step, minus the release. Both so the heading spacing rule can be written once for
 * every section, and so the page can drop the plan and the closing note while no step is shown —
 * an empty plan under "nothing to upgrade" reads as a broken page.
 */
const renderFraming = (html: string): string =>
    `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_FRAMING_CLASS}">${html}</section>`;

/**
 * Tags the upgrade-plan list items with the step each one points at, by the id of its heading, so
 * the plan filters alongside the body instead of promising steps that are no longer shown. The items
 * are tagged by position: a spec asserts the list has exactly one item per step.
 *
 * `li` is aliased on the opening tag by `finalizeOutput`, so the marker has to be an attribute on
 * the existing element rather than a wrapper.
 */
const tagPlanList = (html: string, stepIds: readonly string[]): string => {
    let index = 0;

    return html.replace(PLAN_ITEM, (match, tail: string) => {
        const id = stepIds[index++];

        return id === undefined ? match : `<li data-docs-migration-step="${id}"${tail}`;
    });
};
