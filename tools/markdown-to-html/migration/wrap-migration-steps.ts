import type { DocsHtmlTransform } from '../utils';
import { DocsMigrationSection, docsIsMigrationSource, docsSplitMigrationSections } from './migration-steps';

/**
 * Wraps every numbered step of the migration guide in a `<section>` carrying the release it lands
 * in, so the docs page can hide the steps outside the range the reader picked. Everything the
 * filter reads travels in these attributes; there is no second artifact to keep in sync.
 *
 * Runs after `finalizeOutput`, on exactly the bytes that ship, and is a no-op for every source
 * except the two migration guides.
 */

/** Matches the `<li` of the upgrade-plan list, so each item can be tagged with its step. */
const PLAN_ITEM = /<li(\s|>)/g;

/**
 * The document's `h2`, which opens the preamble. It names the release the whole guide starts from
 * ("How to upgrade from Koobiq 17"), so a page showing a later starting point has to drop it.
 */
const TITLE_HEADING = /<div id="[^"]*" class="docs-header-link kbq-markdown__h2"/;

/** Carried by every section, step or not, so one rule can space them all. */
export const DOCS_MIGRATION_SECTION_CLASS = 'docs-migration-section';

export const DOCS_MIGRATION_STEP_CLASS = 'docs-migration-step';

/** The upgrade plan and the closing note: no step of their own, hidden only when nothing is. */
export const DOCS_MIGRATION_FRAMING_CLASS = 'docs-migration-framing';

export const docsCreateMigrationStepsTransform = (): DocsHtmlTransform => {
    return (html: string, inputPath: string): string => {
        if (!docsIsMigrationSource(inputPath)) {
            return html;
        }

        const { preamble, sections } = docsSplitMigrationSections(html);

        if (!sections.length) {
            throw new Error(`${inputPath}: no "###" sections found — the migration guide layout changed.`);
        }

        const steps = sections.filter((section) => section.number !== null);
        const unversioned = steps.filter((section) => !section.version);

        if (unversioned.length) {
            throw new Error(
                `${inputPath}: no version for step(s) ${unversioned.map(({ number }) => number).join(', ')}. ` +
                    'Spell it in the heading as "(x.y.z)", or add "<!-- migration-step-version(x.y.z) -->" below it.'
            );
        }

        const stepNumbers = steps.map(({ number }) => number!);

        return (
            preamble.replace(TITLE_HEADING, '$& data-docs-migration-title') +
            sections
                .map((section) =>
                    section.number === null ? renderFraming(tagPlanList(section, stepNumbers)) : renderStep(section)
                )
                .join('')
        );
    };
};

const renderStep = (section: DocsMigrationSection): string =>
    `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_STEP_CLASS}"` +
    ` data-docs-migration-step="${section.number}"` +
    ` data-docs-migration-version="${section.version}">${section.html}</section>`;

/**
 * Wrapped like a step, minus the step attributes. Both so the heading spacing rule can be written
 * once for every section, and so the page can drop the plan and the closing note on the one range
 * where they say nothing — an empty plan under "nothing to upgrade" reads as a broken page.
 */
const renderFraming = (html: string): string =>
    `<section class="${DOCS_MIGRATION_SECTION_CLASS} ${DOCS_MIGRATION_FRAMING_CLASS}">${html}</section>`;

/**
 * Tags the upgrade-plan list items with the step each one points at, so the plan filters alongside
 * the body instead of promising steps that are no longer shown. The items are tagged by position:
 * a spec asserts the list has exactly one item per step.
 *
 * `li` is aliased on the opening tag by `finalizeOutput`, so the marker has to be an attribute on
 * the existing element rather than a wrapper.
 */
const tagPlanList = (section: DocsMigrationSection, stepNumbers: readonly number[]): string => {
    // Only the upgrade-plan section carries a list; the closing section is prose and must be left alone.
    if (!section.html.includes('<ol')) {
        return section.html;
    }

    let index = 0;

    return section.html.replace(PLAN_ITEM, (match, tail: string) => {
        const number = stepNumbers[index++];

        return number === undefined ? match : `<li data-docs-migration-step="${number}"${tail}`;
    });
};
