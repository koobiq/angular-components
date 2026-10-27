import { IReleaseTaskConfig } from './base-release-task';
import { createChangelogWriterOptions } from './changelog-writer-options';

const TYPE_LABELS: Record<string, string> = {
    feat: 'Features',
    fix: 'Bug Fixes',
    perf: 'Performance Improvements',
    revert: 'Reverts'
};

/**
 * Minimal stand-in for the conventional-changelog-angular preset's writer options. Mirrors the
 * preset's own transform: a commit is discarded unless it carries a note or its type maps to one
 * of the hardcoded group labels, and only then does a `docs:` commit map to "Documentation".
 */
const presetWriterOptions = {
    headerPartial: (context: any) => `# ${context.title} (2026-01-01)`,
    transform: (commit: any) => {
        if (TYPE_LABELS[commit.type]) {
            return { ...commit, type: TYPE_LABELS[commit.type] };
        }

        if (commit.notes.length === 0) {
            return undefined;
        }

        return { ...commit, type: commit.type === 'docs' ? 'Documentation' : commit.type };
    }
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
    withoutReferences: false,
    withoutNotification: true
};

/** Builds a fake commit as conventional-changelog-writer would hand it to `transform`/`finalizeContext`. */
function makeCommit(overrides: Partial<Record<string, any>>) {
    return {
        type: undefined,
        scope: undefined,
        package: undefined,
        notes: [],
        shortHash: 'abc1234',
        hash: 'abc1234567890',
        ...overrides
    };
}

function finalizeChangelog(
    commitGroups: any[],
    options: {
        existingChangelogContent?: string;
        bugsUrl?: string;
        linkReferences?: boolean;
        withRepositoryContext?: boolean;
        onSkipDuplicate?: (commit: any) => void;
    } = {}
) {
    const writerOptions = createChangelogWriterOptions(
        presetWriterOptions,
        options.linkReferences === undefined ? config : { ...config, withoutReferences: !options.linkReferences },
        options.existingChangelogContent ?? '',
        options.onSkipDuplicate
    );

    const repositoryContext =
        options.withRepositoryContext === false
            ? {}
            : { host: 'https://github.com', owner: 'koobiq', repository: 'angular-components' };

    const context = writerOptions.finalizeContext({
        title: 'Test Release',
        commitGroups,
        repoUrl: 'https://example.com/repo',
        commit: 'commit',
        ...repositoryContext,
        packageData: {
            release: { packages: packageNames },
            bugs: options.bugsUrl ? { url: options.bugsUrl } : {}
        }
    });

    return { context, writerOptions };
}

function renderChangelog(commitGroups: any[], options: Parameters<typeof finalizeChangelog>[1] = {}) {
    const { context, writerOptions } = finalizeChangelog(commitGroups, options);

    return writerOptions.template(context);
}

describe(createChangelogWriterOptions.name, () => {
    describe('transform', () => {
        it('routes a docs: commit with no notes into Documentation, bypassing the preset discard', () => {
            const { writerOptions } = finalizeChangelog([]);

            const transformed = writerOptions.transform(makeCommit({ type: 'docs', notes: [] }), {});

            expect(transformed).toEqual(expect.objectContaining({ type: 'Documentation' }));
        });

        it('delegates a feat: commit to the preset', () => {
            const { writerOptions } = finalizeChangelog([]);

            const transformed = writerOptions.transform(makeCommit({ type: 'feat', notes: [] }), {});

            expect(transformed).toEqual(expect.objectContaining({ type: 'Features' }));
        });

        it('discards a commit whose type has no group and carries no note', () => {
            const { writerOptions } = finalizeChangelog([]);

            const transformed = writerOptions.transform(makeCommit({ type: 'chore', notes: [] }), {});

            expect(transformed).toBeUndefined();
        });

        it('keeps a breaking refactor!: commit, which the preset discards without a note', () => {
            const { writerOptions } = finalizeChangelog([]);
            const commit = makeCommit({
                type: 'refactor',
                header: 'refactor(components)!: remove unused code',
                subject: 'remove unused code'
            });

            const transformed = writerOptions.transform(commit, {});

            expect(transformed.notes).toEqual([
                { title: 'BREAKING CHANGE', type: 'BREAKING CHANGE', text: 'remove unused code' }
            ]);
        });

        it('adds no breaking change note to a header without `!`', () => {
            const { writerOptions } = finalizeChangelog([]);
            const commit = makeCommit({ type: 'refactor', header: 'refactor(core): move x', subject: 'move x' });

            expect(writerOptions.transform(commit, {})).toBeUndefined();
        });

        it('preserves the original note title as note.type when delegating to the preset', () => {
            const { writerOptions } = finalizeChangelog([]);
            const commit = makeCommit({
                type: 'feat',
                notes: [{ title: 'DEPRECATED', text: 'use new api instead' }]
            });

            const transformed = writerOptions.transform(commit, {});

            expect(transformed.notes[0].type).toBe('DEPRECATED');
        });
    });

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

    describe('duplicates', () => {
        const issuesUrl = 'https://github.com/koobiq/angular-components/issues';
        const commitUrl = 'https://github.com/koobiq/angular-components/commit';

        it('skips a commit whose scope and subject already exist in the changelog', () => {
            const onSkipDuplicate = vi.fn();
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
                existingChangelogContent: `# 1.0.0\n\n### Koobiq\n\n * bug fix  **button:** fix duplicate ([e161ca7](${commitUrl}/e161ca7))\n`,
                onSkipDuplicate
            });

            expect(output).not.toContain('fix duplicate');
            expect(output).toContain('fix new one');
            expect(onSkipDuplicate).toHaveBeenCalledTimes(1);
            expect(onSkipDuplicate).toHaveBeenCalledWith(
                expect.objectContaining({ header: 'fix(button): fix duplicate' })
            );
        });

        it('skips a commit whose ticket the changelog holds as plain text', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(toast): stop closing other overlays (#DS-5407) (#2211)',
                            scope: 'toast',
                            subject: `stop closing other overlays (#DS-5407) ([#2211](${issuesUrl}/2211))`
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * bug fix  **toast:** stop closing other overlays (#DS-5407) ([#2211](${issuesUrl}/2211)) ([67d3977](${commitUrl}/67d3977))`
            });

            expect(output).not.toContain('stop closing other overlays');
        });

        it('skips a commit whose ticket an older release linked', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(toast): stop closing other overlays (#DS-5407) (#2211)',
                            scope: 'toast',
                            subject: `stop closing other overlays (#DS-5407) ([#2211](${issuesUrl}/2211))`
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * bug fix  **toast:** stop closing other overlays ([#DS-5407](${issuesUrl}/issue/DS-5407)) ([#2211](${issuesUrl}/2211)) ([67d3977](${commitUrl}/67d3977))`
            });

            expect(output).not.toContain('stop closing other overlays');
        });

        it('skips a commit that the changelog holds under the number of its backport pull request', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(tree): roll the state up once (#DS-5779) (#2221)',
                            scope: 'tree',
                            subject: `roll the state up once (#DS-5779) ([#2221](${issuesUrl}/2221))`
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * bug fix  **tree:** roll the state up once ([#DS-5779](${issuesUrl}/issue/DS-5779)) ([#2223](${issuesUrl}/2223)) ([a8eb783](${commitUrl}/a8eb783))`
            });

            expect(output).not.toContain('roll the state up once');
        });

        it('skips a docs commit whose pull request reference and hash the changelog holds unlinked', () => {
            const commitGroups = [
                {
                    title: 'Documentation',
                    commits: [
                        makeCommit({
                            header: 'docs(ag-grid): add an example (#DS-4572) (#2087)',
                            scope: 'ag-grid',
                            subject: 'add an example (#DS-4572) (#2087)'
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * docs  **ag-grid:** add an example ([#DS-4572](${issuesUrl}/issue/DS-4572)) (#2087) ([undefined](${commitUrl}/bcfb751))`
            });

            expect(output).not.toContain('add an example');
        });

        it('skips a package commit that the changelog holds without its scope, leaving no empty section', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(cli): generate the metadata (#2152)',
                            scope: 'cli',
                            subject: `generate the metadata ([#2152](${issuesUrl}/2152))`
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: `### Cli\n\n * bug fix  generate the metadata ([#2152](${issuesUrl}/2152)) ([e488fdb](${commitUrl}/e488fdb))`
            });

            expect(output).not.toContain('generate the metadata');
            expect(output).not.toContain('### Cli');
        });

        it('keeps a commit whose subject the changelog holds under another scope', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(time-range): errors following a full review (#DS-5531) (#2158)',
                            scope: 'time-range',
                            subject: `errors following a full review (#DS-5531) ([#2158](${issuesUrl}/2158))`
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * bug fix  **tabs:** errors following a full review ([#DS-5531](${issuesUrl}/issue/DS-5531)) ([#2160](${issuesUrl}/2160)) ([f68a2da](${commitUrl}/f68a2da))`
            });

            expect(output).toContain('**time-range:** errors following a full review');
        });

        it('keeps a commit whose subject is only a part of an existing one', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [makeCommit({ header: 'fix(select): typo', scope: 'select', subject: 'typo' })]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ` * bug fix  **select:** typo in the hint ([e161ca7](${commitUrl}/e161ca7))`
            });

            expect(output).toContain('**select:** typo');
        });
    });

    it('leaves a ticket reference as plain text even when bugs.url is set', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [makeCommit({ header: 'fix(button): fix #DS-123', scope: 'button', subject: 'fix #DS-123' })]
            }
        ];

        const output = renderChangelog(commitGroups, {
            bugsUrl: 'https://github.com/koobiq/angular-components/issues'
        });

        expect(output).toContain('**button:** fix #DS-123 (');
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

    it('renders a linked short hash against host/owner/repository when they are known', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(button): add x', scope: 'button', subject: 'add x' })]
            }
        ];

        const output = renderChangelog(commitGroups);

        expect(output).toContain('([abc1234](https://github.com/koobiq/angular-components/commit/abc1234567890))');
    });

    it('falls back to context.repoUrl for the commit link when host/owner/repository are unknown', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(button): add x', scope: 'button', subject: 'add x' })]
            }
        ];

        const output = renderChangelog(commitGroups, { withRepositoryContext: false });

        expect(output).toContain('([abc1234](https://example.com/repo/commit/abc1234567890))');
    });

    it('renders a bare short hash when linkReferences is disabled', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat(button): add x', scope: 'button', subject: 'add x' })]
            }
        ];

        const output = renderChangelog(commitGroups, { linkReferences: false });

        expect(output).toContain('**button:** add x abc1234');
        expect(output).not.toContain('](');
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

    describe('breaking changes and deprecations', () => {
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

            expect(koobiqGroup.breakingChanges).toEqual([
                { type: 'BREAKING CHANGE', text: 'old api removed', scope: 'button' }
            ]);
            expect(koobiqGroup.deprecations).toEqual([
                { type: 'DEPRECATED', text: 'use new api instead', scope: 'button' }
            ]);
        });

        it('renders the notes of each package group after its commits, unscoped first, then by scope', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [
                        makeCommit({
                            header: 'feat: zoneless change detection',
                            subject: 'zoneless change detection',
                            notes: [{ type: 'BREAKING CHANGE', text: 'zone.js is not loaded' }]
                        }),
                        makeCommit({
                            header: 'feat(tabs): rework api',
                            scope: 'tabs',
                            subject: 'rework api',
                            notes: [{ type: 'BREAKING CHANGE', text: 'old api removed' }]
                        }),
                        makeCommit({
                            header: 'feat(button): add replacement',
                            scope: 'button',
                            subject: 'add replacement',
                            notes: [
                                { type: 'BREAKING CHANGE', text: 'the default color changed' },
                                { type: 'DEPRECATED', text: 'use new api instead' }
                            ]
                        }),
                        makeCommit({
                            header: 'feat(cli): drop a flag',
                            scope: 'cli',
                            subject: 'drop a flag',
                            notes: [{ type: 'BREAKING CHANGE', text: 'the flag is gone' }]
                        })
                    ]
                }
            ];

            expect(renderChangelog(commitGroups, { linkReferences: false })).toBe(
                [
                    '# Test Release (2026-01-01)',
                    '',
                    '### Cli',
                    '',
                    ' * feature  drop a flag abc1234',
                    '',
                    '#### BREAKING CHANGES',
                    '',
                    ' * the flag is gone',
                    '',
                    '### Koobiq',
                    '',
                    ' * feature  **button:** add replacement abc1234',
                    ' * feature  **tabs:** rework api abc1234',
                    ' * feature  zoneless change detection abc1234',
                    '',
                    '#### BREAKING CHANGES',
                    '',
                    ' * zone.js is not loaded',
                    ' * **button:** the default color changed',
                    ' * **tabs:** old api removed',
                    '',
                    '#### DEPRECATIONS',
                    '',
                    ' * **button:** use new api instead',
                    '',
                    ''
                ].join('\n')
            );
        });

        it('renders a breaking `!` commit under BREAKING CHANGES of its package group', () => {
            const { writerOptions } = finalizeChangelog([]);
            const commit = writerOptions.transform(
                makeCommit({
                    type: 'fix',
                    header: 'fix(tabs)!: rename the input',
                    scope: 'tabs',
                    subject: 'rename the input'
                }),
                {}
            );

            const output = renderChangelog([{ title: 'Bug Fixes', commits: [commit] }]);

            expect(output).toContain('### Koobiq\n\n * bug fix  **tabs:** rename the input');
            expect(output).toContain('#### BREAKING CHANGES\n\n * **tabs:** rename the input\n');
        });

        it('renders no notes heading for a package group without notes', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [makeCommit({ header: 'feat(button): add icon', scope: 'button', subject: 'add icon' })]
                }
            ];

            expect(renderChangelog(commitGroups)).not.toContain('####');
        });

        it('leaves out the notes of a commit skipped as a duplicate', () => {
            const commitGroups = [
                {
                    title: 'Bug Fixes',
                    commits: [
                        makeCommit({
                            header: 'fix(button)!: apply the default color',
                            scope: 'button',
                            subject: 'apply the default color',
                            notes: [{ type: 'BREAKING CHANGE', text: 'apply the default color' }]
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups, {
                existingChangelogContent: ' * bug fix  **button:** apply the default color ([d941af7](x))'
            });

            expect(output).not.toContain('BREAKING CHANGES');
        });

        it('throws when a commit note has a type that is neither a breaking change nor a deprecation', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [
                        makeCommit({
                            header: 'feat(button): rework api',
                            scope: 'button',
                            subject: 'rework api',
                            notes: [{ type: 'SOMETHING ELSE', text: 'unexpected note' }]
                        })
                    ]
                }
            ];

            expect(() => finalizeChangelog(commitGroups)).toThrow('Found commit note that is not known');
        });
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

        it('drops the redundant **docs:** prefix for a feat(docs)/fix(docs) commit', () => {
            const commitGroups = [
                {
                    title: 'Features',
                    commits: [
                        makeCommit({
                            header: 'feat(docs): test commit.',
                            scope: 'docs',
                            subject: 'test commit.'
                        })
                    ]
                }
            ];

            const output = renderChangelog(commitGroups);

            expect(output).not.toContain('**docs:**');
            expect(output).toContain('test commit.');
        });
    });
});
