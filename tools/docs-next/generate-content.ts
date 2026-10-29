/**
 * Compiles the MDX pages the unified docs prototype (`apps/docs-next`) shows into static JSON under
 * `dist/docs-next-content`, which the app loads at runtime. Live examples stay out: each example becomes a block with
 * its title and source files, rendered as a static viewer frame.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { basename, join } from 'path';
import { DOCS_NEXT_COMPONENTS } from '../../apps/docs-next/src/app/data/components';
import { DOCS_NEXT_GUIDE_SOURCES } from '../../apps/docs-next/src/app/data/sections';
import { EXAMPLE_COMPONENTS, LiveExample } from '../../packages/docs-examples/example-module';
import { CompiledBlock, compilePage } from '../docs-pages/compile-page';

const OUTPUT_DIR = join('dist', 'docs-next-content');
const LOCALES = ['ru', 'en'];

type ContentBlock =
    | { kind: 'html'; html: string }
    | { kind: 'code'; language: string; content: string }
    | { kind: 'example'; id: string; title: string; files: { name: string; content: string }[] };

const readExampleFiles = (example: LiveExample): { name: string; content: string }[] =>
    example.files.map((name) => ({
        name,
        content: readFileSync(join('packages', 'docs-examples', example.packagePath, name), 'utf8')
    }));

const compileBlocks = (path: string): ContentBlock[] => {
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
    let codeIndex = 0;

    for (const { node, template } of topLevel) {
        if (node.type === 'code') {
            blocks.push({ kind: 'code', ...codeBlocks[codeIndex++] });
        } else if (node.type === 'mdxJsxFlowElement' && node.name === 'Example') {
            const id = String(
                node.attributes.find((attribute) => 'name' in attribute && attribute.name === 'id')?.value
            );
            const example = EXAMPLE_COMPONENTS[id];

            blocks.push({ kind: 'example', id, title: example.title, files: readExampleFiles(example) });
        } else if (template) {
            const last = blocks.at(-1);

            if (last?.kind === 'html') {
                last.html += template;
            } else {
                blocks.push({ kind: 'html', html: template });
            }
        }
    }

    return blocks;
};

const findComponentSource = (name: string, locale: string, examples: boolean): string | undefined =>
    globSync(`packages/components/**/${examples ? 'examples.' : ''}${name}.${locale}.mdx`, { posix: true })[0];

const write = (path: string, blocks: ContentBlock[]): void => {
    mkdirSync(join(OUTPUT_DIR, ...path.split('/').slice(0, -1)), { recursive: true });
    writeFileSync(join(OUTPUT_DIR, `${path}.json`), JSON.stringify(blocks));
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

            write(`components/${component.id}.${locale}`, sources.flatMap(compileBlocks));
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
                write(`pages/${pageId}.${locale}`, compileBlocks(path));
                count++;
            } catch (error) {
                console.warn(`${basename(path)}: skipped, ${(error as Error).message}`);
            }
        }
    }

    console.log(`docs-next: compiled ${count} pages into ${OUTPUT_DIR}`);
};

generate();
