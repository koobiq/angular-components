import { spawnSync } from 'child_process';
import { NpmViewError, npmViewDistTag } from './npm-client';

jest.mock('child_process');

const spawnSyncMock = spawnSync as jest.MockedFunction<typeof spawnSync>;

const mockResult = (overrides: { status?: number | null; stdout?: string; stderr?: string }) =>
    ({
        status: overrides.status ?? 0,
        stdout: Buffer.from(overrides.stdout ?? ''),
        stderr: Buffer.from(overrides.stderr ?? ''),
        pid: 0,
        output: [],
        signal: null
    }) as unknown as ReturnType<typeof spawnSync>;

describe(npmViewDistTag.name, () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns the published version on success', () => {
        spawnSyncMock.mockReturnValue(mockResult({ status: 0, stdout: '12.1.1\n' }));

        expect(npmViewDistTag('@koobiq/icons', 'latest')).toBe('12.1.1');
    });

    it('returns null when the package/tag has never been published (E404)', () => {
        spawnSyncMock.mockReturnValue(
            mockResult({
                status: 1,
                stderr: 'npm error code E404\nnpm error 404 Not Found - GET https://registry.npmjs.org/...'
            })
        );

        expect(npmViewDistTag('@koobiq/definitely-new', 'latest')).toBeNull();
    });

    it('returns null when the package exists but the tag does not (success, empty stdout)', () => {
        spawnSyncMock.mockReturnValue(mockResult({ status: 0, stdout: '' }));

        expect(npmViewDistTag('@koobiq/icons', 'no-such-tag')).toBeNull();
    });

    it('throws instead of returning null on a non-404 failure, e.g. a registry 5xx', () => {
        spawnSyncMock.mockReturnValue(
            mockResult({
                status: 1,
                stderr: 'npm error code E500\nnpm error 500 Internal Server Error'
            })
        );

        expect(() => npmViewDistTag('@koobiq/icons', 'latest')).toThrow(NpmViewError);
    });

    it('throws instead of returning null on a network failure', () => {
        spawnSyncMock.mockReturnValue(
            mockResult({
                status: 1,
                stderr: 'npm error code ENOTFOUND\nnpm error network request failed'
            })
        );

        expect(() => npmViewDistTag('@koobiq/icons', 'latest')).toThrow(NpmViewError);
    });

    it('throws instead of returning null on an auth failure', () => {
        spawnSyncMock.mockReturnValue(
            mockResult({
                status: 1,
                stderr: 'npm error code E401\nnpm error 401 Unauthorized'
            })
        );

        expect(() => npmViewDistTag('@koobiq/icons', 'latest')).toThrow(NpmViewError);
    });
});
