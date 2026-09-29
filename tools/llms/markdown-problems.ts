import type { Nodes, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { docsGetPagePaths } from '../../apps/docs/src/app/page-paths';
import { LLMS_TXT } from './llms-txt';
import { LLMS_SITE_ORIGIN } from './sources';

const parser = unified().use(remarkParse).use(remarkGfm);

/** Every page the site renders, the way a link names it: `/en/components/alert/api`. */
const SITE_PAGES = new Set(docsGetPagePaths().map(({ path }) => path));

const findLinkProblem = (url: string, served: ReadonlySet<string>): string | null => {
    if (url.startsWith('#')) return null;

    if (!/^(https?|mailto):/.test(url)) return `a relative link, which leads nowhere outside the site: ${url}`;

    if (!url.startsWith(`${LLMS_SITE_ORIGIN}/`)) return null;

    const path = url.slice(LLMS_SITE_ORIGIN.length).split(/[?#]/)[0];

    if (/\.(md|txt)$/.test(path)) {
        return served.has(path.slice(1)) || path.slice(1) === LLMS_TXT
            ? null
            : `a link to a file the site does not serve: ${url}`;
    }

    return SITE_PAGES.has(path.replace(/(.)\/$/, '$1')) ? null : `a link to a page the site does not have: ${url}`;
};

/**
 * What a reader of the Markdown would stumble over outside the site: raw HTML, which only the site renders, a leftover
 * of MDX, a title missing from the top or repeated, a heading that skips a level, a link that leads nowhere. `served`
 * holds the paths of the files the site serves under its root, which links to Markdown are checked against.
 */
export const findMarkdownProblems = (text: string, served: ReadonlySet<string>): string[] => {
    const root = parser.parse(text) as Root;
    const problems: string[] = [];
    let titles = 0;
    let previousDepth = 0;

    const visit = (node: Nodes): void => {
        switch (node.type) {
            case 'html':
                problems.push(`raw HTML, which only the site renders: ${node.value.slice(0, 60)}`);
                break;
            case 'text':
                if (/<Example\b|\{\/\*|\[object Object\]/.test(node.value)) {
                    problems.push(`a leftover of MDX: ${node.value.slice(0, 60)}`);
                }

                break;
            case 'heading':
                if (node.depth === 1) titles++;

                if (node.depth > previousDepth + 1) {
                    problems.push(
                        `"${toString(node)}", a heading of level ${node.depth} right under level ${previousDepth}`
                    );
                }

                previousDepth = node.depth;
                break;
            case 'link':
            case 'definition': {
                const problem = findLinkProblem(node.url, served);

                if (problem) problems.push(problem);
                break;
            }
        }

        if ('children' in node) node.children.forEach(visit);
    };

    visit(root);

    if (titles !== 1 || root.children[0]?.type !== 'heading' || root.children[0].depth !== 1) {
        problems.push(`expected one title at the very top, found ${titles}`);
    }

    return problems;
};
