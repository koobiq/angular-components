import { createNewVersion } from './create-version';
import { parseVersionName } from './parse-version';

describe(createNewVersion.name, () => {
    it('should create a patch version', () => {
        expect(createNewVersion(parseVersionName('1.2.3')!, 'patch').format()).toBe('1.2.4');
    });

    it('should create a minor version', () => {
        expect(createNewVersion(parseVersionName('1.2.3')!, 'minor').format()).toBe('1.3.0');
    });

    it('should create a major version', () => {
        expect(createNewVersion(parseVersionName('1.2.3')!, 'major').format()).toBe('2.0.0');
    });

    it('should bump the prerelease number', () => {
        expect(createNewVersion(parseVersionName('1.2.3-rc.1')!, 'bump-prerelease').format()).toBe('1.2.3-rc.2');
    });

    it('should drop the prerelease label on a normal release', () => {
        expect(createNewVersion(parseVersionName('1.2.3-rc.1')!, 'patch').format()).toBe('1.2.4');
    });

    it('should make a stable release from a prerelease', () => {
        expect(createNewVersion(parseVersionName('1.2.3-rc.1')!, 'stable-release').format()).toBe('1.2.3');
    });
});
