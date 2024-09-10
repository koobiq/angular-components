/**
 * Script that will be used to transform
 * multiple markdown files into the equivalent HTML output.
 */
import { docTask } from './utils';

const makeDocsContent = async () => {
    for (const task of [
        docTask('markdown-docs-koobiq', {
            source: [
                'packages/components/**/!(README|examples*).md',
                'packages/components-experimental/**/!(README|examples*).md',
                'docs/guides/*.md'
            ],
            dest: 'dist/docs-content/overviews'
        }),

        docTask('markdown-docs-cdk', {
            source: 'packages/cdk/**/!(README|examples*).md',
            dest: 'dist/docs-content/cdk'
        }),

        docTask('markdown-docs-koobiq', {
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

makeDocsContent();
