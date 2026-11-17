import { parseVersionName } from '../version-name/parse-version';
import * as npmClient from './npm-client';
import { resolveNpmDistTag } from './resolve-npm-dist-tag';

jest.mock('./npm-client');

const npmViewDistTag = npmClient.npmViewDistTag as jest.MockedFunction<typeof npmClient.npmViewDistTag>;

describe(resolveNpmDistTag.name, () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('tags a version that outranks the published latest as "latest"', () => {
        npmViewDistTag.mockReturnValue('11.7.1');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.0.0')!)).toBe('latest');
    });

    it('tags a version within the same major that outranks latest as "latest"', () => {
        npmViewDistTag.mockReturnValue('12.1.0');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.1')!)).toBe('latest');
    });

    it('tags a patch on an older major as "v<major>-lts", not "latest"', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => (tag === 'latest' ? '11.3.0' : null));

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('10.10.1')!)).toBe('v10-lts');
    });

    it('tags a lower version of the current major as "v<major>-lts"', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => (tag === 'latest' ? '12.1.1' : null));

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.0.9')!)).toBe('v12-lts');
    });

    it('tags a republish of the exact version already tagged "latest" as "latest"', () => {
        npmViewDistTag.mockReturnValue('12.1.1');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.1')!)).toBe('latest');
    });

    it('tags the first-ever publish (no "latest" yet) as "latest"', () => {
        npmViewDistTag.mockReturnValue(null);

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.0')!)).toBe('latest');
    });

    it('tags a republish of the version already held by "v<major>-lts" as that same tag', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => (tag === 'latest' ? '12.1.1' : '11.3.0'));

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('11.3.0')!)).toBe('v11-lts');
    });

    it.each(['alpha', 'beta', 'rc'])('tags a %s prerelease as "next", never "latest"', (label) => {
        npmViewDistTag.mockReturnValue('20.2.0');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName(`20.3.0-${label}.0`)!)).toBe('next');
    });

    it('tags a prerelease as "next" even when it outranks the published latest', () => {
        npmViewDistTag.mockReturnValue('20.2.0');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('20.3.0-alpha.0')!)).toBe('next');
    });

    it('never lets a newer prerelease move "latest" backward onto an older one', () => {
        npmViewDistTag.mockReturnValue('20.3.0-rc.0');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('20.3.0-alpha.0')!)).toBe('next');
    });

    it('throws when the published "latest" is not a valid semver version', () => {
        npmViewDistTag.mockReturnValue('not-a-version');

        expect(() => resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.0')!)).toThrow(npmClient.NpmViewError);
    });

    it('falls back to "v<major>.<minor>-lts" when "v<major>-lts" points at a newer version', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => {
            if (tag === 'latest') return '12.0.0';
            if (tag === 'v11-lts') return '11.9.5';

            return null;
        });

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('11.4.2')!)).toBe('v11.4-lts');
    });

    it('publishes a 20.3.5 backport under v20.3-lts when v20-lts is already at 20.4.5', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => {
            if (tag === 'latest') return '21.0.0';
            if (tag === 'v20-lts') return '20.4.5';

            return null;
        });

        expect(resolveNpmDistTag('@koobiq/components', parseVersionName('20.3.5')!)).toBe('v20.3-lts');
    });

    it('tags a republish of the version already held by "v<major>.<minor>-lts" as that same tag', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => {
            if (tag === 'latest') return '12.0.0';
            if (tag === 'v11-lts') return '11.9.5';
            if (tag === 'v11.4-lts') return '11.4.2';

            return null;
        });

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('11.4.2')!)).toBe('v11.4-lts');
    });

    it('moves "v<major>.<minor>-lts" forward onto a newer patch of the same minor', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => {
            if (tag === 'latest') return '12.0.0';
            if (tag === 'v11-lts') return '11.9.5';
            if (tag === 'v11.4-lts') return '11.4.1';

            return null;
        });

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('11.4.2')!)).toBe('v11.4-lts');
    });

    it('refuses to move "v<major>.<minor>-lts" backward onto an older version', () => {
        npmViewDistTag.mockImplementation((_packageName, tag) => {
            if (tag === 'latest') return '12.0.0';
            if (tag === 'v11-lts') return '11.9.5';
            if (tag === 'v11.4-lts') return '11.4.5';

            return null;
        });

        expect(() => resolveNpmDistTag('@koobiq/icons', parseVersionName('11.4.2')!)).toThrow(npmClient.NpmViewError);
    });

    it('propagates a thrown NpmViewError instead of falling back to a tag', () => {
        npmViewDistTag.mockImplementation(() => {
            throw new npmClient.NpmViewError('npm view failed (exit 1): registry 5xx');
        });

        expect(() => resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.0')!)).toThrow(npmClient.NpmViewError);
    });
});
