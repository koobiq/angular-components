/**
 * Script that will be used to transform
 * multiple markdown files into the equivalent HTML output.
 */
import { docTask } from './utils';

const examplesDirComponents = ['packages/components/**/!(README|examples*).md', 'docs/guides/*.md'];
const examplesDirCdk = 'packages/cdk/**/!(README|examples*).md';
const examplesDirExamples = 'packages/components/**/examples.*.md';

const markdownDocsKoobiq = docTask('markdown-docs-koobiq', {
    source: examplesDirComponents,
    dest: 'dist/docs-content/overviews'
});
const markdownDocsCdk = docTask('markdown-docs-cdk', { source: examplesDirCdk, dest: 'dist/docs-content/cdk' });
const markdownDocsExamples: () => object = docTask('markdown-docs-koobiq', {
    source: examplesDirExamples,
    dest: 'dist/docs-content/examples'
});

const docsContent = async () => {
    for (const task of [markdownDocsKoobiq, markdownDocsCdk, markdownDocsExamples]) {
        await task();
    }
};

docsContent();
