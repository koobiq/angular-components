import fs from 'fs';
import { IReleaseTaskConfig } from './base-release-task';
import { createChangelogWriterOptions } from './changelog-writer-options';

/** Minimal stand-in for the conventional-changelog-angular preset's writer options. */
const presetWriterOptions = {
    headerPartial: (context: any) => `# ${context.title} (2026-01-01)`,
    transform: (commit: any) => commit
};

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

function renderChangelog(commitGroups: any[], existingChangelogContent = '') {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(existingChangelogContent);

    const writerOptions = createChangelogWriterOptions('CHANGELOG.md', presetWriterOptions, config);

    const context = writerOptions.finalizeContext({
        title: 'Test Release',
        commitGroups,
        packageData: {
            release: {
                packages: [
                    'components',
                    'components-experimental',
                    'angular-luxon-adapter',
                    'angular-moment-adapter',
                    'cli'
                ]
            },
            bugs: {}
        }
    });

    return writerOptions.template(context);
}

describe(createChangelogWriterOptions.name, () => {
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

    it('skips commits whose subject already exists in the changelog', () => {
        const commitGroups = [
            {
                title: 'Bug Fixes',
                commits: [
                    makeCommit({ header: 'fix(button): fix duplicate', subject: 'fix duplicate' }),
                    makeCommit({ header: 'fix(button): fix new one', subject: 'fix new one' })
                ]
            }
        ];

        const output = renderChangelog(commitGroups, '# 1.0.0\n\n * bug fix fix duplicate');

        expect(output).not.toContain('fix duplicate');
        expect(output).toContain('fix new one');
    });

    it('routes an unscoped commit to the configured changelogScope package', () => {
        const commitGroups = [
            {
                title: 'Features',
                commits: [makeCommit({ header: 'feat: add x', subject: 'add x' })]
            }
        ];

        expect(renderChangelog(commitGroups)).toContain('### Koobiq');
    });
});
