/**
 * Script that will be used to transform
 * multiple markdown files into the equivalent HTML output.
 */
import { DOCS_OVERVIEW_SOURCES, generateSeoDescriptions } from './generate-seo-descriptions';
import { docsCreateMigrationStepsTransform } from './migration/wrap-migration-steps';
import { docTask } from './utils';

const docsContent = async () => {
    const wrapMigrationSteps = docsCreateMigrationStepsTransform();

    for (const task of [
        docTask('docs-content-overviews', {
            source: DOCS_OVERVIEW_SOURCES,
            dest: 'dist/docs-content/overviews',
            transforms: [wrapMigrationSteps]
        }),

        docTask('docs-content-examples', {
            source: [
                'packages/components/**/examples.*.md',
                'packages/components-experimental/**/examples.*.md'
            ],
            dest: 'dist/docs-content/examples'
        })
    ]) {
        await task();
    }

    await generateSeoDescriptions(DOCS_OVERVIEW_SOURCES);
};

docsContent();
