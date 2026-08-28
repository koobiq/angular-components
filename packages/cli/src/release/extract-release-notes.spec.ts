import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { extractReleaseNotes, parseTag, resolveChangelogPath } from './extract-release-notes';

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

describe(parseTag.name, () => {
    it('should treat a plain version tag as version-only', () => {
        expect(parseTag('18.10.0')).toEqual({ project: null, version: '18.10.0' });
    });

    it('should split a project-scoped tag into project and version', () => {
        expect(parseTag('ag-grid-angular-theme@34.5.1')).toEqual({
            project: 'ag-grid-angular-theme',
            version: '34.5.1'
        });
    });

    it('should split on the last @ so a scoped npm package name still works', () => {
        expect(parseTag('@koobiq/components@18.10.0')).toEqual({
            project: '@koobiq/components',
            version: '18.10.0'
        });
    });
});

describe(resolveChangelogPath.name, () => {
    let workspaceRoot: string;

    beforeEach(() => {
        workspaceRoot = mkdtempSync(join(tmpdir(), 'extract-release-notes-'));
        writeFileSync(join(workspaceRoot, 'CHANGELOG.md'), '# root changelog');
        mkdirSync(join(workspaceRoot, 'packages', 'ag-grid-angular-theme'), { recursive: true });
        writeFileSync(join(workspaceRoot, 'packages', 'ag-grid-angular-theme', 'CHANGELOG.md'), '# project changelog');
    });

    afterEach(() => {
        rmSync(workspaceRoot, { recursive: true, force: true });
    });

    it('should resolve to the root changelog for an unscoped tag', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: null, version: '18.10.0' });

        expect(path).toBe(join(workspaceRoot, 'CHANGELOG.md'));
    });

    it('should resolve to the project changelog when it exists', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: 'ag-grid-angular-theme', version: '34.5.1' });

        expect(path).toBe(join(workspaceRoot, 'packages', 'ag-grid-angular-theme', 'CHANGELOG.md'));
    });

    it('should fall back to the root changelog when the project has none', () => {
        const path = resolveChangelogPath(workspaceRoot, { project: 'no-such-project', version: '1.0.0' });

        expect(path).toBe(join(workspaceRoot, 'CHANGELOG.md'));
    });
});
