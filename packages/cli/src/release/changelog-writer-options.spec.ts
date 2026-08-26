import fs from 'fs';
import { IReleaseTaskConfig } from './base-release-task';
import { createChangelogWriterOptions } from './changelog-writer-options';

/** Minimal stand-in for the conventional-changelog-angular preset's writer options. */
const presetWriterOptions = {
    headerPartial: (context: any) => `# ${context.title} (2026-01-01)`,
    transform: (commit: any) => commit
};

const packageNames = [
    'components',
    'components-experimental',
    'angular-luxon-adapter',
    'angular-moment-adapter',
    'cli'
];

const config: IReleaseTaskConfig = {
    projectDir: '/repo',
    repoToken: '',
    distDir: '',
    tagName: '',
    repoOwner: '',
    repoName: '',
    repoUrl: '',
    changelogScope: 'koobiq',
    withoutReferences: true,
    withoutNotification: true
};

/** Builds a fake commit as conventional-changelog-writer would hand it to `finalizeContext`. */
function makeCommit(overrides: Partial<Record<string, any>>) {
    return {
        scope: undefined,
        package: undefined,
        notes: [],
        shortHash: 'abc1234',
        hash: 'abc1234567890',
        ...overrides
    };
}

afterEach(() => {
    jest.restoreAllMocks();
});

function finalizeChangelog(
    commitGroups: any[],
    options: { existingChangelogContent?: string; bugsUrl?: string; linkReferences?: boolean } = {}
) {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(options.existingChangelogContent ?? '');

    const writerOptions = createChangelogWriterOptions(
        'CHANGELOG.md',
        presetWriterOptions,
        options.linkReferences === undefined ? config : { ...config, withoutReferences: !options.linkReferences }
    );

    const context = writerOptions.finalizeContext({
        title: 'Test Release',
        commitGroups,
        repoUrl: 'https://example.com/repo',
        commit: 'commit',
        packageData: {
            release: { packages: packageNames },
            bugs: options.bugsUrl ? { url: options.bugsUrl } : {}
        }
    });

    return { context, writerOptions };
}

function renderChangelog(
    commitGroups: any[],
    options: { existingChangelogContent?: string; bugsUrl?: string; linkReferences?: boolean } = {}
) {
    const { context, writerOptions } = finalizeChangelog(commitGroups, options);

    return writerOptions.template(context);
}

describe(createChangelogWriterOptions.name, () => {
    it('groups a commit under its explicit package', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(components): add x', package: 'components', subject: 'add x' })]
            }
        ];

        const output = renderChangelog(commitGroups);

        expect(output).toContain('### Components');
        expect(output).toContain('add x');
    });

    it('remaps a scope that matches a real package name onto commit.package', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [makeCommit({ header: 'fix(cli): fix y', scope: 'cli', subject: 'fix y' })]
            }
        ];

        const output = renderChangelog(commitGroups);

        // Once remapped, the scope no longer renders as a bold `**cli:**` prefix on the commit line.
        expect(output).toContain('### Cli');
        expect(output).not.toContain('**cli:**');
    });

    it('falls back to config.changelogScope for a scope that is not a real package name', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(button): add icon', scope: 'button', subject: 'add icon' })]
            }
        ];

        const output = renderChangelog(commitGroups);

        expect(output).toContain('### Koobiq');
        expect(output).toContain('**button:** add icon');
    });

    it('skips a commit whose subject already exists in the changelog', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [
                    makeCommit({ header: 'fix(button): fix duplicate', scope: 'button', subject: 'fix duplicate' }),
                    makeCommit({ header: 'fix(button): fix new one', scope: 'button', subject: 'fix new one' })
                ]
            }
        ];

        const output = renderChangelog(commitGroups, {
            existingChangelogContent: '# 1.0.0\n\n * bug fix fix duplicate'
        });

        expect(output).not.toContain('fix duplicate');
        expect(output).toContain('fix new one');
    });

    it('rewrites #PROJ-123 issue references in the subject when bugs.url is set', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [makeCommit({ header: 'fix(button): fix #DS-123', scope: 'button', subject: 'fix #DS-123' })]
            }
        ];

        const output = renderChangelog(commitGroups, {
            bugsUrl: 'https://github.com/koobiq/angular-components/issues'
        });

        expect(output).toContain('[#DS-123](https://github.com/koobiq/angular-components/issues/issue/DS-123)');
    });

    it('does not rewrite issue references when bugs.url is not set', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [makeCommit({ header: 'fix(button): fix #DS-123', scope: 'button', subject: 'fix #DS-123' })]
            }
        ];

        const output = renderChangelog(commitGroups);

        expect(output).toContain('fix #DS-123');
        expect(output).not.toContain('[#DS-123]');
    });

    it('orders hardcoded packages first and unknown packages alphabetically after', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [
                    makeCommit({ header: 'feat(zzz-extra): z', package: 'zzz-extra', subject: 'z' }),
                    makeCommit({ header: 'feat(cli): c', package: 'cli', subject: 'c' }),
                    makeCommit({ header: 'feat(components): a', package: 'components', subject: 'a' }),
                    makeCommit({ header: 'feat(aaa-extra): a2', package: 'aaa-extra', subject: 'a2' })
                ]
            }
        ];

        const output = renderChangelog(commitGroups);
        const order = ['Components', 'Cli', 'Aaa Extra', 'Zzz Extra'].map((title) => output.indexOf(`### ${title}`));

        expect(order.every((index) => index !== -1)).toBe(true);
        expect(order).toEqual([...order].sort((a, b) => a - b));
    });

    it('renders a linked short hash when linkReferences is enabled', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(button): add x', scope: 'button', subject: 'add x' })]
            }
        ];

        const output = renderChangelog(commitGroups, { linkReferences: true });

        expect(output).toContain('([abc1234](https://example.com/repo/commit/abc1234567890))');
    });

    it('collects breaking-change and deprecation notes onto the commit package group', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [
                    makeCommit({
                        header: 'feat(button): rework api',
                        scope: 'button',
                        subject: 'rework api',
                        notes: [{ type: 'BREAKING CHANGE', text: 'old api removed' }]
                    }),
                    makeCommit({
                        header: 'feat(button): add replacement',
                        scope: 'button',
                        subject: 'add replacement',
                        notes: [{ type: 'DEPRECATED', text: 'use new api instead' }]
                    })
                ]
            }
        ];

        const { context } = finalizeChangelog(commitGroups);
        const koobiqGroup = context.packageGroups.find((group: any) => group.title === 'Koobiq');

        expect(koobiqGroup.breakingChanges).toEqual([{ type: 'BREAKING CHANGE', text: 'old api removed' }]);
        expect(koobiqGroup.deprecations).toEqual([{ type: 'DEPRECATED', text: 'use new api instead' }]);
    });

    it('renders the full multi-commit output shape', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [
                    makeCommit({ header: 'feat(button): add icon', scope: 'button', subject: 'add icon' }),
                    makeCommit({ header: 'feat(cli): add flag', scope: 'cli', subject: 'add flag' })
                ]
            },
            {
                title: 'Bug Fixes',
                commits: [makeCommit({ header: 'fix(button): fix z-index', scope: 'button', subject: 'fix z-index' })]
            }
        ];

        expect(renderChangelog(commitGroups)).toMatchSnapshot();
    });

    describe('Documentation section', () => {
        it('renders a Documentation section, after package sections, for docs-typed and docs-scoped commits', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [
                        makeCommit({
                            header: 'feat(docs): test commit.',
                            scope: 'docs',
                            subject: 'test commit.'
                        }),
                        makeCommit({
                            header: 'feat(docs,select): another commit',
                            scope: 'docs,select',
                            subject: 'another commit'
                        }),
                        makeCommit({
                            header: 'feat(button): add icon support',
                            scope: 'button',
                            subject: 'add icon support'
                        })
                    ]
                },
                {
                    title: 'Documentation',
                    commits: [
                        makeCommit({
                            header: 'docs: third commit',
                            subject: 'third commit'
                        })
                    ]
                }
            ];

            expect(renderChangelog(commitGroups)).toMatchSnapshot();
        });

        it('excludes a multi-value scope like "docs,select" from the Documentation section', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [
                        makeCommit({
                            header: 'feat(docs,select): another commit',
                            scope: 'docs,select',
                            subject: 'another commit'
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups);

            expect(output).not.toContain('### Documentation');
            expect(output).toContain('### Koobiq');
        });
    });
});
