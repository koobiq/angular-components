/**
 * Script that will be used to transform
 * multiple markdown files into the equivalent HTML output.
 */
import { generateSeoDescriptions } from './generate-seo-descriptions';
import { docTask } from './utils';

const overviewSources = [
    'packages/components/**/!(README|examples*).md',
    'packages/components-experimental/**/!(README|examples*).md',
    'docs/guides/**/*.md',
    'docs/data-grid/**/*.md'
];

const docsContent = async () => {
    for (const task of [
        docTask('docs-content-overviews', {
            source: overviewSources,
            dest: 'dist/docs-content/overviews'
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

    await generateSeoDescriptions(overviewSources);
};

docsContent();
