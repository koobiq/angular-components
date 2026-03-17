import fs from 'fs';
import { extractReleaseNotes } from './extract-release-notes';

describe(extractReleaseNotes.name, () => {
    it('should extract release notes for a version between two other versions', () => {
        const targetVersion = '18.9.1';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(`${targetVersion} (2024-12-04)`);
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('**common:** support SSR');
        expect(result!.releaseNotes).toContain('bug fix  **popover:** header z-index fix');
    });

    it('should extract release notes for the latest version', () => {
        const targetVersion = '18.10.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toBe(`# ${targetVersion} (2024-12-11)`);
        expect(result!.releaseNotes).toContain('Cdk');
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('* feature  **markdown:** code with links styles');
    });

    it('should extract release notes for the initial version properly', () => {
        const targetVersion = '18.8.0';
        const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

        expect(result).not.toBeNull();
        expect(result!.releaseTitle).toContain(targetVersion);
        expect(result!.releaseNotes).toContain('Koobiq');
        expect(result!.releaseNotes).toContain('* feature  **tabs:** added pagination for KbqTabNavBar');
    });

    it('should not include notes from other versions', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '18.10.0');

        expect(result!.releaseNotes).not.toContain('18.9.1');
        expect(result!.releaseNotes).not.toContain('* bug fix  **common:** support SSR');
    });

    it('should return null when the version is not found', () => {
        const result = extractReleaseNotes('CHANGELOG.md', '3.0.0');

        expect(result).toBeNull();
    });

    describe('custom changelog content', () => {
        const CHANGELOG_CONTENT = `# 1.2.3 (2024-11-29)

 * bumped package to 15.10.1
 
# 1.2.2 (2024-11-29)

source code didn't change.

# 1.2.1 (2024-11-29)

 * bumped package to 15.10.0`;

        beforeEach(() => {
            fs.readFileSync = jest.fn(() => CHANGELOG_CONTENT) as any;
        });

        it('should extract properly if release notes contains only simple string', () => {
            const targetVersion = '1.2.2';
            const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

            expect(result).not.toBeNull();
            expect(result!.releaseTitle).toContain(targetVersion);
            expect(result!.releaseNotes).toContain("source code didn't change.");
            expect(result!.releaseNotes).not.toContain('1.2.1');
        });

        it('should extract properly if release notes contains third-party package version bump', () => {
            const targetVersion = '1.2.3';
            const result = extractReleaseNotes('CHANGELOG.md', targetVersion);

            expect(result).not.toBeNull();
            expect(result!.releaseTitle).toContain(targetVersion);
            expect(result!.releaseTitle).not.toContain('15.10.1');
            expect(result!.releaseNotes).toContain('bumped package to 15.10.1');
        });
    });
});
