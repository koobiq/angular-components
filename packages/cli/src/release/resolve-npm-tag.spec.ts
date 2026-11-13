import { readFileSync } from 'fs';
import type { MockInstance } from 'vitest';
import { resolveNpmDistTag } from './npm/resolve-npm-dist-tag';
import { ResolveNpmTagTask } from './resolve-npm-tag';

// The module under test imports `readFileSync` by name, which a spy on the `fs` object cannot reach.
vi.mock('fs', { spy: true });
vi.mock('./npm/resolve-npm-dist-tag');

const PROJECT_DIR = '/repo';
const PACKAGE_NAME = '@koobiq/components';

describe(ResolveNpmTagTask.name, () => {
    let exitSpy: MockInstance<typeof process.exit>;
    let consoleLogSpy: MockInstance<typeof console.log>;
    let consoleErrorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
        exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`process.exit(${code})`);
        });
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.mocked(readFileSync).mockReset();
        vi.restoreAllMocks();
    });

    const runTask = (packageName?: string): void => {
        new ResolveNpmTagTask({ projectDir: PROJECT_DIR, packageName }).run();
    };

    it('should require --package-name', () => {
        expect(runTask).toThrow('process.exit(1)');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('--package-name'));
    });

    it('should fail on an unreadable package.json', () => {
        vi.mocked(readFileSync).mockImplementation(() => {
            throw new Error('ENOENT');
        });

        expect(() => runTask(PACKAGE_NAME)).toThrow('process.exit(1)');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Could not read'));
    });

    it('should fail when package.json has no version', () => {
        vi.mocked(readFileSync).mockReturnValue('{}');

        expect(() => runTask(PACKAGE_NAME)).toThrow('process.exit(1)');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('No "version" field found'));
    });

    it('should fail on an unparseable version', () => {
        vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: 'not-semver' }));

        expect(() => runTask(PACKAGE_NAME)).toThrow('process.exit(1)');
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not-semver'));
    });

    it('should print only the resolved tag', () => {
        vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '21.0.0' }));
        vi.mocked(resolveNpmDistTag).mockReturnValue('v21-lts');

        runTask(PACKAGE_NAME);

        expect(resolveNpmDistTag).toHaveBeenCalledWith(
            PACKAGE_NAME,
            expect.objectContaining({ major: 21, minor: 0, patch: 0 })
        );
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('v21-lts');
        expect(exitSpy).not.toHaveBeenCalled();
    });
});
