import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { checkKoobiqPackage, checkReleaseBundle, checkTypeDefinitionFile } from './output-validations';

describe(checkReleaseBundle.name, () => {
    let workspaceRoot: string;

    beforeEach(() => {
        workspaceRoot = mkdtempSync(join(tmpdir(), 'release-output-'));
    });

    afterEach(() => {
        rmSync(workspaceRoot, { recursive: true, force: true });
    });

    it('should flag sourcemap references in component styles', () => {
        const bundlePath = join(workspaceRoot, 'bundle.js');

        writeFileSync(bundlePath, 'styles: ["body { color: red; } sourceMappingURL=data:application/json"]');

        expect(checkReleaseBundle(bundlePath)).toEqual(['Found sourcemap references in component styles.']);
    });

    it('should pass a bundle without sourcemap references', () => {
        const bundlePath = join(workspaceRoot, 'bundle.js');

        writeFileSync(bundlePath, 'export const version = "1.0.0";\n');

        expect(checkReleaseBundle(bundlePath)).toEqual([]);
    });
});

describe(checkTypeDefinitionFile.name, () => {
    let workspaceRoot: string;

    beforeEach(() => {
        workspaceRoot = mkdtempSync(join(tmpdir(), 'release-output-'));
    });

    afterEach(() => {
        rmSync(workspaceRoot, { recursive: true, force: true });
    });

    it('should allow a type import of an existing relative path', () => {
        const filePath = join(workspaceRoot, 'index.d.ts');

        writeFileSync(join(workspaceRoot, 'exists.d.ts'), 'export declare const exists: number;\n');
        writeFileSync(filePath, "export type T = import('./exists').SomeType;\n");

        expect(checkTypeDefinitionFile(filePath)).toEqual([]);
    });

    it('should flag a type import of a missing relative path', () => {
        const filePath = join(workspaceRoot, 'index.d.ts');

        writeFileSync(filePath, "export type T = import('./missing').SomeType;\n");

        expect(checkTypeDefinitionFile(filePath)).toEqual(['Found relative type imports which do not exist.']);
    });

    it('should flag an absolute type import path', () => {
        const filePath = join(workspaceRoot, 'index.d.ts');

        writeFileSync(filePath, "export type T = import('/abs/path').SomeType;\n");

        expect(checkTypeDefinitionFile(filePath)).toEqual(['Found absolute type imports in definition file.']);
    });
});

describe(checkKoobiqPackage.name, () => {
    let workspaceRoot: string;

    beforeEach(() => {
        workspaceRoot = mkdtempSync(join(tmpdir(), 'release-output-'));
    });

    afterEach(() => {
        rmSync(workspaceRoot, { recursive: true, force: true });
    });

    it('should pass a koobiq package with prebuilt themes', () => {
        mkdirSync(join(workspaceRoot, 'prebuilt-themes'), { recursive: true });
        writeFileSync(join(workspaceRoot, 'prebuilt-themes', 'theme.css'), 'body { color: red; }\n');
        writeFileSync(join(workspaceRoot, '_theming.scss'), '// theming\n');

        expect(checkKoobiqPackage(workspaceRoot)).toEqual([]);
    });

    it('should flag a koobiq package without prebuilt themes', () => {
        mkdirSync(join(workspaceRoot, 'prebuilt-themes'), { recursive: true });
        writeFileSync(join(workspaceRoot, '_theming.scss'), '// theming\n');

        expect(checkKoobiqPackage(workspaceRoot)).toEqual(['No prebuilt themes could be found.']);
    });
});
