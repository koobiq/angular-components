import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { checkReleasePackage } from './check-packages';

describe(checkReleasePackage.name, () => {
    const packageName = 'components';
    let releasesPath: string;

    beforeEach(() => {
        releasesPath = mkdtempSync(join(tmpdir(), 'release-output-'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        rmSync(releasesPath, { recursive: true, force: true });
    });

    const createPackage = (name: string) => {
        const packagePath = join(releasesPath, name);

        mkdirSync(join(packagePath, 'bundles'), { recursive: true });
        writeFileSync(join(packagePath, 'bundles', 'pkg.js'), 'export const value = 1;\n');
        writeFileSync(join(packagePath, 'index.d.ts'), 'export declare const value: number;\n');
        writeFileSync(join(packagePath, 'LICENSE'), 'license text');
        writeFileSync(join(packagePath, 'README.md'), '# readme');

        return packagePath;
    };

    it('should accept a complete package', () => {
        createPackage(packageName);

        expect(checkReleasePackage(releasesPath, packageName)).toBe(true);
    });

    it('should reject a package missing LICENSE', () => {
        const packagePath = createPackage(packageName);

        rmSync(join(packagePath, 'LICENSE'));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(checkReleasePackage(releasesPath, packageName)).toBe(false);
    });

    it('should reject a package missing README.md', () => {
        const packagePath = createPackage(packageName);

        rmSync(join(packagePath, 'README.md'));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(checkReleasePackage(releasesPath, packageName)).toBe(false);
    });

    it('should reject a package whose bundle has a sourcemap ref', () => {
        const packagePath = createPackage(packageName);

        writeFileSync(join(packagePath, 'bundles', 'pkg.js'), 'styles: ["x sourceMappingURL=y"]');
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(checkReleasePackage(releasesPath, packageName)).toBe(false);
    });

    it('should run koobiq-specific checks only for the koobiq package', () => {
        const packagePath = createPackage('koobiq');

        mkdirSync(join(packagePath, 'prebuilt-themes'), { recursive: true });
        writeFileSync(join(packagePath, 'prebuilt-themes', 'theme.css'), 'body { color: red; }\n');
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(checkReleasePackage(releasesPath, 'koobiq')).toBe(false);
    });
});
