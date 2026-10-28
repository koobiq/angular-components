import { readFileSync } from 'fs';
import core from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';
import type { Code, Nodes } from 'mdast';
import { DOCS_HIGHLIGHT_JS_LANGUAGES } from '../../apps/docs/src/app/constants/highlight-js';
import { parsePage } from './compile-page';
import { findPageSources } from './sources';

// Parses every page.
vi.setConfig({ testTimeout: 30_000 });

const codeBlocksOf = (node: Nodes): Code[] => {
    if (node.type === 'code') return [node];

    return 'children' in node ? (node.children as Nodes[]).flatMap(codeBlocksOf) : [];
};

describe('languages of the code blocks', () => {
    // The code block shows a language the site does not load as plain text, and says so only in dev mode, which the
    // prerender is not.
    it('should be loaded by the docs app; add a missing one to DOCS_HIGHLIGHT_JS_LANGUAGES', async () => {
        // An instance of its own: the module is the one the full bundle registers every language on.
        const hljs = core.newInstance();

        for (const [name, load] of Object.entries(DOCS_HIGHLIGHT_JS_LANGUAGES)) {
            hljs.registerLanguage(name, (await load()).default);
        }

        // The code block registers it itself.
        hljs.registerLanguage('plaintext', plaintext);

        const unknown = findPageSources().flatMap((path) =>
            codeBlocksOf(parsePage(readFileSync(path, 'utf8'), path))
                .filter(({ lang }) => lang && !hljs.getLanguage(lang))
                .map(({ lang, position }) => `${path}:${position?.start.line}: ${lang}`)
        );

        expect(unknown).toEqual([]);
    });
});
