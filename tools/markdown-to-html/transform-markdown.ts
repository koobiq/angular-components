/**
 * Script that will be used to transform
 * multiple markdown files into the equivalent HTML output.
 */
import { docTask } from './utils';

const docsContent = async () => {
    for (const task of [
        docTask('docs-content-overviews', {
            source: [
                'packages/components/**/!(README|examples*).md',
                'packages/components-experimental/**/!(README|examples*).md',
                'docs/guides/**/*.md',
                'docs/data-grid/**/*.md'
            ],
            dest: 'dist/docs-content/overviews'
        }),

        docTask('docs-content-cdk', {
            source: [
                'packages/cdk/**/!(README|examples*).md'
            ],
            dest: 'dist/docs-content/cdk'
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
};

docsContent();
