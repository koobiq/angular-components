/**
 * Compiles the MDX pages the unified docs prototype (`apps/docs-next`) shows into static JSON under
 * `dist/docs-next-content`, which the app loads at runtime. Live examples stay out: each example becomes a block with
 * its title, rendered as a static viewer frame. The source files of the examples go to a file of their own next to the
 * page (`<page>.sources.json`): they are most of the weight of a page and are only needed when the code is opened.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { basename, join } from 'path';
import { DOCS_NEXT_COMPONENTS } from '../../apps/docs-next/src/app/data/components';
import { DOCS_NEXT_GUIDE_SOURCES } from '../../apps/docs-next/src/app/data/sections';
import { EXAMPLE_COMPONENTS, LiveExample } from '../../packages/docs-examples/example-module';
import { CompiledBlock, compilePage, renderCodeBlockElement } from '../docs-pages/compile-page';

const OUTPUT_DIR = join('dist', 'docs-next-content');
const LOCALES = ['ru', 'en'];

type ContentBlock =
    | { kind: 'html'; html: string }
    | { kind: 'code'; language: string; content: string }
    | { kind: 'example'; id: string; title: string; sources: string };

type ExampleFiles = { name: string; content: string }[];

const readExampleFiles = (example: LiveExample): ExampleFiles =>
    example.files.map((name) => ({
        name,
        content: readFileSync(join('packages', 'docs-examples', example.packagePath, name), 'utf8')
    }));

const escapeHtml = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Code nested in a block of HTML, such as a note, stays in that HTML: the compiled page binds it by index, which the
 * prototype cannot do. It is shown there as plain preformatted text instead, without the highlighting of a code block.
 */
const withPlainCode = (template: string, codeBlocks: { content: string; language: string }[]): string =>
    codeBlocks.reduce(
        (html, { content, language }, index) =>
            html.replace(
                renderCodeBlockElement(index),
                () =>
                    `<pre class="kbq-markdown__pre"><code class="kbq-markdown__code language-${escapeHtml(language)}">${escapeHtml(content)}</code></pre>`
            ),
        template
    );

/**
 * The blocks of a page. The source files of its examples are added to `sources` by example id, and the blocks name the
 * file they will be in by `sourcesKey`, the address of the page without the extension.
 */
const compileBlocks = (path: string, sourcesKey: string, sources: Record<string, ExampleFiles>): ContentBlock[] => {
    let topLevel: CompiledBlock[] = [];
    const { codeBlocks } = compilePage(readFileSync(path, 'utf8'), {
        path,
        examples: EXAMPLE_COMPONENTS,
        url: null,
        output: 'html',
        layout: (blocks) => {
            topLevel = blocks;

            return '';
        }
    });

    const blocks: ContentBlock[] = [];

    for (const { node, template } of topLevel) {
        if (node.type === 'code') {
            blocks.push({ kind: 'code', content: node.value, language: node.lang ?? 'plaintext' });
        } else if (node.type === 'mdxJsxFlowElement' && node.name === 'Example') {
            const id = String(
                node.attributes.find((attribute) => 'name' in attribute && attribute.name === 'id')?.value
            );
            const example = EXAMPLE_COMPONENTS[id];

            sources[id] = readExampleFiles(example);
            blocks.push({ kind: 'example', id, title: example.title, sources: sourcesKey });
        } else if (template) {
            const html = withPlainCode(template, codeBlocks);
            const last = blocks.at(-1);

            if (last?.kind === 'html') {
                last.html += html;
            } else {
                blocks.push({ kind: 'html', html });
            }
        }
    }

    return blocks;
};

const findComponentSource = (name: string, locale: string, examples: boolean): string | undefined =>
    globSync(`packages/components/**/${examples ? 'examples.' : ''}${name}.${locale}.mdx`, { posix: true })[0];

const write = (path: string, blocks: ContentBlock[], sources: Record<string, ExampleFiles>): void => {
    mkdirSync(join(OUTPUT_DIR, ...path.split('/').slice(0, -1)), { recursive: true });
    writeFileSync(join(OUTPUT_DIR, `${path}.json`), JSON.stringify(blocks));

    if (Object.keys(sources).length) writeFileSync(join(OUTPUT_DIR, `${path}.sources.json`), JSON.stringify(sources));
};

const generate = (): void => {
    if (existsSync(OUTPUT_DIR)) rmSync(OUTPUT_DIR, { recursive: true });

    let count = 0;

    for (const component of DOCS_NEXT_COMPONENTS) {
        if (!component.angular) continue;

        for (const locale of LOCALES) {
            // The overview of the unified site takes in the examples tab of the current one.
            const sources = [
                findComponentSource(component.angular, locale, false),
                findComponentSource(component.angular, locale, true)
            ].filter((path): path is string => !!path);

            if (!sources.length) continue;

            const key = `components/${component.id}.${locale}`;
            const exampleFiles: Record<string, ExampleFiles> = {};

            write(
                key,
                sources.flatMap((path) => compileBlocks(path, key, exampleFiles)),
                exampleFiles
            );
            count++;
        }
    }

    for (const [pageId, pattern] of Object.entries(DOCS_NEXT_GUIDE_SOURCES)) {
        for (const locale of LOCALES) {
            const path = pattern.replace('{locale}', locale);

            if (!existsSync(path)) {
                console.warn(`${path}: not found, the page "${pageId}" shows placeholder text`);
                continue;
            }

            try {
                const key = `pages/${pageId}.${locale}`;
                const exampleFiles: Record<string, ExampleFiles> = {};

                write(key, compileBlocks(path, key, exampleFiles), exampleFiles);
                count++;
            } catch (error) {
                console.warn(`${basename(path)}: skipped, ${(error as Error).message}`);
            }
        }
    }

    console.log(`docs-next: compiled ${count} pages into ${OUTPUT_DIR}`);
};

generate();
