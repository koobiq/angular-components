import fs from 'fs';
import { extractReleaseNotes } from './extract-release-notes';

const CHANGELOG_CONTENT = `## 2.0.0

### Breaking Changes

 * Removed deprecated API

## 1.1.0

### Features

 * Added new feature X
 * Added new feature Y

### Bug Fixes

 * Fixed issue Z

## 1.0.0

### Features

 * Initial release
`;

describe(extractReleaseNotes.name, () => {
    beforeEach(() => {
        fs.readFileSync = jest.fn(() => CHANGELOG_CONTENT) as any;
    });

    it('should extract release notes for a version between two other versions', () => {
        const targetVersion = '1.1.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toBe(targetVersion);
        expect(result!.releaseNotes).toContain('Added new feature X');
        expect(result!.releaseNotes).toContain('Fixed issue Z');
    });

    it('should extract release notes for the latest version', () => {
        const targetVersion = '2.0.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toBe(targetVersion);
        expect(result!.releaseNotes).toContain('Removed deprecated API');
    });

    it('should extract release notes for the initial version properly', () => {
        const targetVersion = '1.0.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toBe(targetVersion);
        expect(result!.releaseNotes).toContain('Features');
        expect(result!.releaseNotes).toContain('Initial release');
    });

    it('should not include notes from other versions', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '1.1.0');

        expect(result!.releaseNotes).not.toContain('Removed deprecated API');
        expect(result!.releaseNotes).not.toContain('Initial release');
    });

    it('should return null when the version is not found', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '3.0.0');

        expect(result).toBeNull();
    });
});
