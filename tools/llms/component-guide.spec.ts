import type { DocsStructureItem } from '../../apps/docs/src/app/structure';
import { ComponentGuide, findGuideProblems, parseComponentGuide, renderComponentGuide } from './component-guide';

const DASH = '—';

const GUIDE = [
    '# which_component_when data source',
    '',
    '## Provenance',
    '',
    '| Source        | What it holds |',
    '| ------------- | ------------- |',
    '| `*.ru.mdx`    | A mirror      |',
    '',
    '## Disambiguation',
    '',
    '### Show that something is in progress',
    '',
    '| Task           | Use            | Not        | Why not            |',
    '| -------------- | -------------- | ---------- | ------------------ |',
    '| Share is known | `progress-bar` | `skeleton` | A spinner is vague |',
    '',
    '### Text that does not fit',
    '',
    '| Task          | Use         | Not       | Why not                   |',
    '| ------------- | ----------- | --------- | ------------------------- |',
    '| Cut at an end | `kbq-title` | `tooltip` | A tooltip fires when fits |',
    '',
    '## Component index',
    '',
    'One line each.',
    '',
    '### Feedback and status',
    '',
    `- \`progress-bar\` ${DASH} a measurable share of a task. → \`skeleton\` for a layout that loads.`,
    `- \`kbq-title\` ${DASH} text that is truncated.`,
    `- Number formatters ${DASH} numbers in the conventions of the locale.`,
    '',
    '## Keyword index',
    '',
    'Words → the cluster.',
    '',
    '- loading, percent → Show that something is in progress',
    '- truncated, hint → Text that does not fit'
].join('\n');

describe(parseComponentGuide.name, () => {
    it('finds the clusters, the component index and the keywords by their shape, not by their titles', () => {
        const guide = parseComponentGuide(GUIDE);

        expect(guide.clusters.map(({ title, slug }) => ({ title, slug }))).toEqual([
            { title: 'Show that something is in progress', slug: 'show-that-something-is-in-progress' },
            { title: 'Text that does not fit', slug: 'text-that-does-not-fit' }
        ]);
        expect(guide.clusters[0].body).toBe(
            [
                '| Task | Use | Not | Why not |',
                '| - | - | - | - |',
                '| Share is known | `progress-bar` | `skeleton` | A spinner is vague |'
            ].join('\n')
        );
        expect(guide.componentGroups).toEqual([
            {
                title: 'Feedback and status',
                components: [
                    {
                        names: ['progress-bar'],
                        line: `- \`progress-bar\` ${DASH} a measurable share of a task. → \`skeleton\` for a layout that loads.`
                    },
                    { names: ['kbq-title'], line: `- \`kbq-title\` ${DASH} text that is truncated.` },
                    { names: [], line: `- Number formatters ${DASH} numbers in the conventions of the locale.` }
                ]
            }
        ]);
        expect(guide.keywords).toEqual([
            { words: 'loading, percent', cluster: 'Show that something is in progress' },
            { words: 'truncated, hint', cluster: 'Text that does not fit' }
        ]);
    });

    it('reads the keywords under the subsections of the keyword index too', () => {
        const guide = parseComponentGuide(GUIDE.replace('- truncated, hint', '### Text\n\n- truncated, hint'));

        expect(guide.keywords.map(({ words }) => words)).toEqual(['loading, percent', 'truncated, hint']);
    });

    it('keeps the keyword index apart from a component line that names its neighbor with an arrow', () => {
        const guide = parseComponentGuide(
            GUIDE.replace(
                'numbers in the conventions of the locale.',
                'numbers in the conventions of the locale. → `progress-bar` for a share.'
            )
        );

        expect(guide.keywords.map(({ words }) => words)).toEqual(['loading, percent', 'truncated, hint']);
    });

    it('fails on a missing part, which the skills and the MCP server rely on', () => {
        expect(() => parseComponentGuide(GUIDE.replace(/^- (loading|truncated).*$/gm, ''))).toThrow(
            'docs/guides/which-component-when.en.md: no part holds the keyword index'
        );
    });
});

describe(renderComponentGuide.name, () => {
    it('writes the index of the clusters and a file per cluster, every component linked to its Markdown', () => {
        const files = renderComponentGuide(
            parseComponentGuide(GUIDE),
            (id) => (id === 'progress-bar' || id === 'title' ? `https://koobiq.io/en/components/${id}.md` : undefined),
            (path) => `https://koobiq.io/${path}`
        );

        expect([...files.keys()]).toEqual([
            'which-component-when.md',
            'which-component-when/show-that-something-is-in-progress.md',
            'which-component-when/text-that-does-not-fit.md'
        ]);
        expect(files.get('which-component-when.md')).toContain(
            '| truncated, hint | [Text that does not fit](https://koobiq.io/which-component-when/text-that-does-not-fit.md) |'
        );
        expect(files.get('which-component-when.md')).toContain(
            `- [\`kbq-title\`](https://koobiq.io/en/components/title.md) ${DASH} text that is truncated.`
        );
        expect(files.get('which-component-when/show-that-something-is-in-progress.md')).toContain(
            '| Share is known | [`progress-bar`](https://koobiq.io/en/components/progress-bar.md) | `skeleton` | A spinner is vague |'
        );
    });
});

describe(findGuideProblems.name, () => {
    const guide: ComponentGuide = {
        clusters: [],
        keywords: [],
        componentGroups: [
            {
                title: 'Overlays',
                components: [
                    { names: ['kbq-title'], line: `- \`kbq-title\` ${DASH} truncated text` },
                    { names: ['popup'], line: `- \`popup\` ${DASH} a dialog beside a control` }
                ]
            }
        ]
    };
    const items = [{ id: 'title' }, { id: 'tooltip' }] as DocsStructureItem[];

    it('reports a component without a line, and a name that is the id of no page', () => {
        expect(findGuideProblems(guide, items, new Set(['title', 'tooltip']))).toEqual([
            'the component "tooltip" has no line in the component index',
            '"popup" in the component index is the id of no page'
        ]);
    });
});
