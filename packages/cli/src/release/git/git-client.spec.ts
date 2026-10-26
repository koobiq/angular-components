import { spawnSync } from 'child_process';
import type { MockedFunction } from 'vitest';
import { GitClient } from './git-client';

vi.mock('child_process');

const spawnSyncMock = spawnSync as MockedFunction<typeof spawnSync>;

const mockResult = (overrides: { status?: number | null; error?: Error }) =>
    ({
        status: overrides.status === undefined ? 0 : overrides.status,
        stdout: '',
        stderr: '',
        error: overrides.error,
        pid: 0,
        output: [],
        signal: null
    }) as unknown as ReturnType<typeof spawnSync>;

describe(GitClient.name, () => {
    const git = new GitClient('/project', 'origin');

    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetAllMocks();
    });

    describe('createTag', () => {
        it('passes the message through stdin, not the command line', () => {
            // Longer than the 32767-character command line of Windows.
            const releaseNotes = 'x'.repeat(40_000);

            spawnSyncMock.mockReturnValue(mockResult({ status: 0 }));

            expect(git.createTag('21.0.0', releaseNotes)).toBe(true);
            expect(spawnSyncMock).toHaveBeenCalledWith(
                'git',
                ['tag', '-s', '21.0.0', '-F', '-'],
                expect.objectContaining({ cwd: '/project', input: releaseNotes })
            );
        });

        it('reports why Git could not be started', () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            spawnSyncMock.mockReturnValue(mockResult({ status: null, error: new Error('spawnSync git ENAMETOOLONG') }));

            expect(git.createTag('21.0.0', 'notes')).toBe(false);
            expect(errorSpy).toHaveBeenCalledWith('spawnSync git ENAMETOOLONG');
        });
    });
});
