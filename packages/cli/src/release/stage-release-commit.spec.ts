import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { MockInstance } from 'vitest';
import { GitClient } from './git/git-client';
import { promptForNewVersion } from './prompt/new-version-prompt';
import { StageReleaseCommitTask } from './stage-release-commit';
import { parseVersionName } from './version-name/parse-version';

vi.mock('./changelog', () => ({ promptAndGenerateChangelog: vi.fn() }));
vi.mock('./extract-release-notes', () => ({
    extractReleaseNotes: vi.fn(() => ({ releaseTitle: VERSION, releaseNotes: 'Release notes' }))
}));
vi.mock('./prompt/new-version-prompt', () => ({ promptForNewVersion: vi.fn() }));

const VERSION = '1.2.3';

class TestTask extends StageReleaseCommitTask {
    protected override promptConfirm(): Promise<boolean> {
        return Promise.resolve(true);
    }
}

const createGit = () => ({
    remoteGitUrl: 'https://example.com/repo.git',
    getCurrentBranch: vi.fn(() => 'main'),
    getRemoteCommitSha: vi.fn(() => 'head-sha'),
    getLocalCommitSha: vi.fn(() => 'head-sha'),
    hasUncommittedChanges: vi.fn(() => false),
    stageAllChanges: vi.fn(() => true),
    createNewCommit: vi.fn(() => true),
    hasRemote: vi.fn(() => true),
    hasLocalTag: vi.fn(() => false),
    createTag: vi.fn(() => true),
    getShaOfRemoteTag: vi.fn(() => ''),
    pushBranchToRemote: vi.fn(() => true),
    pushTagToRemote: vi.fn(() => true)
});

describe(StageReleaseCommitTask.name, () => {
    let projectDir: string;
    let git: ReturnType<typeof createGit>;
    let errorSpy: MockInstance<typeof console.error>;

    beforeAll(() => {
        projectDir = mkdtempSync(join(tmpdir(), 'stage-release-commit-'));
        writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ version: VERSION }));
    });

    afterAll(() => {
        rmSync(projectDir, { recursive: true, force: true });
    });

    beforeEach(() => {
        vi.mocked(promptForNewVersion).mockResolvedValue(parseVersionName(VERSION)!);
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'info').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`process.exit(${code})`);
        });

        git = createGit();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const runTask = () => {
        const task = new TestTask({
            projectDir,
            repoToken: '',
            distDir: '',
            repoOwner: 'owner',
            repoName: 'repo',
            repoUrl: git.remoteGitUrl,
            changelogScope: '',
            withoutReferences: true,
            withoutNotification: true
        });

        task.git = git as unknown as GitClient;

        return task.run();
    };

    it('should commit, push the branch and then push the release tag', async () => {
        await runTask();

        expect(git.createNewCommit).toHaveBeenCalledWith(`chore: bump version to ${VERSION} w/ changelog`);
        expect(git.pushBranchToRemote).toHaveBeenCalledWith('upstream', 'main');
        expect(git.pushTagToRemote).toHaveBeenCalledWith(VERSION, 'upstream');
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it.each(['stageAllChanges', 'createNewCommit'] as const)(
        'should stop before tagging when %s fails',
        async (step) => {
            git[step].mockReturnValue(false);

            await expect(runTask()).rejects.toThrow('process.exit(1)');

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining(`Could not create the staging commit for "${VERSION}"`)
            );
            expect(git.createTag).not.toHaveBeenCalled();
            expect(git.pushBranchToRemote).not.toHaveBeenCalled();
            expect(git.pushTagToRemote).not.toHaveBeenCalled();
        }
    );

    it('should not push the release tag when the branch push fails', async () => {
        git.pushBranchToRemote.mockReturnValue(false);

        await expect(runTask()).rejects.toThrow('process.exit(1)');

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Could not push the "main" branch upstream'));
        expect(git.pushTagToRemote).not.toHaveBeenCalled();
    });
});
