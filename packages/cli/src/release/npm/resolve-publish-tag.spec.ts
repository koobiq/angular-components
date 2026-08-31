import { parseVersionName } from '../version-name/parse-version';
import * as npmClient from './npm-client';
import { resolveNpmDistTag } from './resolve-publish-tag';

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
        npmViewDistTag.mockReturnValue('11.3.0');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('10.10.1')!)).toBe('v10-lts');
    });

    it('tags a lower version of the current major as "v<major>-lts"', () => {
        npmViewDistTag.mockReturnValue('12.1.1');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('11.7.2')!)).toBe('v11-lts');
    });

    it('tags a republish of the exact version already tagged "latest" as "latest"', () => {
        npmViewDistTag.mockReturnValue('12.1.1');

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.1')!)).toBe('latest');
    });

    it('tags the first-ever publish (no "latest" yet) as "latest"', () => {
        npmViewDistTag.mockReturnValue(null);

        expect(resolveNpmDistTag('@koobiq/icons', parseVersionName('12.1.0')!)).toBe('latest');
    });
});
