/* tslint:disable:no-var-requires */
import { Dgeni } from 'dgeni';
import { task, src, dest, series } from 'gulp';
import * as path from 'path';

import {
    CLASS_PREFIX,
    MARKDOWN_TAGS_TO_CLASS_ALIAS,
    MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS
} from '../../../packages/components/markdown/markdown.values';
import { apiDocsPackageConfig } from '../../dgeni/bin';
import { buildConfig } from '../build-config';


const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const flatten = require('gulp-flatten');
const hljs = require('highlight.js');


const { outputDir } = buildConfig;

const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

// Markdown files can contain links to other markdown files.
// Most of those links don't work in the koobiq docs, because the paths are invalid in the
// documentation page. Using a RegExp to rewrite links in HTML files to work in the docs.
const LINK_PATTERN = /(<a[^>]*) href="([^"]*)"/g;

const tagNameStringAliaser = createTagNameStringAliaser(CLASS_PREFIX);

const markdownOptions = {
    // Add syntax highlight using highlight.js
    highlight: (code: string, language: string): string => {
        if (language) {
            // highlight.js expects "typescript" written out, while Github supports "ts".
            const lang = language.toLowerCase() === 'ts' ? 'typescript' : language;

            return hljs.highlight(code, { language: lang }).value;
        }

        return code;
    }
};


task('api-docs', () => {
    // Run the docs generation. The process will be automatically kept alive until Dgeni
    // completed. In case the returned promise has been rejected, we need to manually exit the
    // process with the proper exit code because Dgeni doesn't use native promises which would
    // automatically cause the error to propagate.
    const docs = new Dgeni([apiDocsPackageConfig]);

    return docs.generate()
        .catch((e: any) => {
            // tslint:disable-next-line:no-console
            console.error(e);
            process.exit(1);
        });
});

task('markdown-docs-koobiq', () => {
    markdown.marked.Renderer.prototype.heading = (text: string, level: number): string => {
        // tslint:disable-next-line:no-magic-numbers
        if ([3, 4, 5].includes(level)) {
            const escapedText = text.toLowerCase().replace(/\s/g, '-');

            return `
                <div id="${escapedText}" class="docs-header-link kbq-markdown__h${level}">
                  <span header-link="${escapedText}"></span>
                  ${text}
                </div>
              `;
        } else {
            return `<div class="docs-header-link kbq-markdown__h${level}">${text}</div>`;
        }
    };

    return src(['packages/components/**/!(README|examples*).md', 'docs/guides/*.md'])
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(flatten())
        .pipe(dest('dist/docs-content/overviews'));
});

task('markdown-docs-cdk', () => {
    markdown.marked.Renderer.prototype.heading = (text: string, level: number): string => {
        // tslint:disable-next-line:no-magic-numbers
        if ([3, 4, 5].includes(level)) {
            const escapedText = text.toLowerCase().replace(/\s/g, '-');

            return `
                <div id="${escapedText}" class="docs-header-link kbq-markdown__h${level}">
                  <span header-link="${escapedText}"></span>
                  ${text}
                </div>
              `;
        } else {
            return `<div class="docs-header-link kbq-markdown__h${level}">${text}</div>`;
        }
    };

    return src(['packages/cdk/**/!(README|examples*).md'])
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(flatten())
        .pipe(dest('dist/docs-content/cdk'));
});

task('markdown-docs-examples', () => {
    return src('packages/components/**/examples.*.md')
        .pipe(markdown(markdownOptions))
        .pipe(transform(transformMarkdownFiles))
        .pipe(flatten())
        .pipe(dest('dist/docs-content/examples'));
});

task(
    'docs-content',
    series(
        'markdown-docs-cdk',
        'markdown-docs-koobiq',
        'markdown-docs-examples',
        'api-docs'
    )
);

/** Updates the markdown file's content to work inside of the docs app. */
function transformMarkdownFiles(buffer: Buffer, file: any): string {
    let content = buffer.toString('utf-8');
    content = tagNameStringAliaser(content);

    // Replace <!-- example(..) --> comments with HTML elements.
    content = content.replace(
        EXAMPLE_PATTERN,
        (_, name: string) => `<div koobiq-docs-example="${name}"></div>`
    );

    // Replace the URL in anchor elements inside of compiled markdown files.
    content = content.replace(LINK_PATTERN, (_match: string, head: string, link: string) =>
        // The head is the first match of the RegExp and is necessary to ensure that the RegExp matches
        // an anchor element. The head will be then used to re-create the existing anchor element.
        // If the head is not prepended to the replaced value, then the first match will be lost.
        `${head} href="${fixMarkdownDocLinks(link, file.path)}"`
    );

    // Finally, wrap the entire generated in a doc in a div with a specific class.
    return `<div class="kbq-markdown">${content}</div>`;
}

/** Fixes paths in the markdown files to work in the koobiq. */
function fixMarkdownDocLinks(link: string, filePath: string): string {
    // As for now, only markdown links that are relative and inside of the guides/ directory
    // will be rewritten.
    if (!filePath.includes(path.normalize('guides/')) || link.startsWith('http')) { return link; }

    const baseName = path.basename(link, path.extname(link));

    // Temporary link the file to the /guide URL because that's the route where the
    // guides can be loaded in the koobiq docs.
    return `guide/${baseName}`;
}


function createTagNameStringAliaser(classPrefix: string) {
    return (content: string) => {
        let str = setImageCaption(content);

        MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            str = str.replace(
                new RegExp(`<${tag}`, 'g'),
                (_match: string) => `<${tag} class="${classPrefix}__${tag}"`
            );
        });

        MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            str = str.replace(
                new RegExp(`<${tag}\s*>`, 'g'),
                (_match: string) => `<${tag} class="${classPrefix}__${tag}">`
            );
        });

        return str;
    };
}

function setImageCaption(content: string): string  {
    let html = content;
    let pos = 0;

    while (html.includes('<img', pos)) {
        const imgIndex = html.indexOf('<img', pos);
        const captionIndex = html.indexOf('>', imgIndex) + 1;
        html = [html.slice(0, captionIndex), '<em>', html.slice(captionIndex)]
            .join('');

        const captionEndIndex = html.indexOf('</', captionIndex);
        html = [html.slice(0, captionEndIndex), '</em>', html.slice(captionEndIndex)]
            .join('');

        pos = imgIndex + 1;
    }

    return html;
}

function setTargetBlank(content: string): string {
    return content.replace(
        new RegExp(`href=".[^"]*"`, 'g'), // .[^"]* - any symbol exept "
        (match: string) => `${match} target="_blank"`
    );
}
