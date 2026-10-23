import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { migrateSource } from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'dl-standalone-names';

const migrate = (source: string): string => migrateSource(source, 'file.ts').content;

describe(SCHEMATIC_NAME, () => {
    describe('renames', () => {
        it('should rename the classes in the import and in every use, as a value and as a type', () => {
            expect(
                migrate(
                    "import { Component, viewChild } from '@angular/core';\n" +
                        "import { KbqDdComponent, KbqDlComponent, KbqDtComponent } from '@koobiq/components/dl';\n" +
                        '\n' +
                        "@Component({ imports: [KbqDlComponent, KbqDtComponent, KbqDdComponent], template: '' })\n" +
                        'export class App {\n' +
                        '    readonly list = viewChild.required(KbqDlComponent);\n' +
                        '    typed: KbqDlComponent | null = null;\n' +
                        '    isList = (value: unknown): value is KbqDlComponent => value instanceof KbqDlComponent;\n' +
                        '}\n'
                )
            ).toBe(
                "import { Component, viewChild } from '@angular/core';\n" +
                    "import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';\n" +
                    '\n' +
                    "@Component({ imports: [KbqDl, KbqDt, KbqDd], template: '' })\n" +
                    'export class App {\n' +
                    '    readonly list = viewChild.required(KbqDl);\n' +
                    '    typed: KbqDl | null = null;\n' +
                    '    isList = (value: unknown): value is KbqDl => value instanceof KbqDl;\n' +
                    '}\n'
            );
        });

        it('should keep the local name of an aliased import', () => {
            expect(
                migrate(
                    "import { KbqDlComponent as List } from '@koobiq/components/dl';\n" +
                        'export const lists = [List];\n'
                )
            ).toBe("import { KbqDl as List } from '@koobiq/components/dl';\n" + 'export const lists = [List];\n');
        });

        it('should drop the old import when the new class is imported already', () => {
            expect(
                migrate(
                    "import { KbqDl, KbqDlComponent } from '@koobiq/components/dl';\n" +
                        'export const lists = [KbqDl, KbqDlComponent];\n'
                )
            ).toBe("import { KbqDl } from '@koobiq/components/dl';\n" + 'export const lists = [KbqDl, KbqDl];\n');
        });

        it('should rename a type-only import', () => {
            expect(
                migrate(
                    "import type { KbqDlComponent } from '@koobiq/components/dl';\n" +
                        "import { type KbqDtComponent } from '@koobiq/components/dl';\n" +
                        'export type Pair = [KbqDlComponent, KbqDtComponent];\n'
                )
            ).toBe(
                "import type { KbqDl } from '@koobiq/components/dl';\n" +
                    "import { type KbqDt } from '@koobiq/components/dl';\n" +
                    'export type Pair = [KbqDl, KbqDt];\n'
            );
        });

        it('should rename the members of a namespace import', () => {
            expect(
                migrate(
                    "import * as dl from '@koobiq/components/dl';\n" +
                        'export const list: dl.KbqDlComponent | null = null;\n' +
                        'export const term = dl.KbqDtComponent;\n'
                )
            ).toBe(
                "import * as dl from '@koobiq/components/dl';\n" +
                    'export const list: dl.KbqDl | null = null;\n' +
                    'export const term = dl.KbqDt;\n'
            );
        });

        it('should keep the names a barrel re-exports', () => {
            expect(
                migrate(
                    "export { KbqDlComponent, KbqDlModule, KbqDtComponent as Term } from '@koobiq/components/dl';\n"
                )
            ).toBe("export { KbqDl as KbqDlComponent, KbqDlModule, KbqDt as Term } from '@koobiq/components/dl';\n");

            expect(
                migrate(
                    "import { KbqDlComponent } from '@koobiq/components/dl';\n" +
                        'export { KbqDlComponent };\n' +
                        'export const lists = { KbqDlComponent };\n'
                )
            ).toBe(
                "import { KbqDl } from '@koobiq/components/dl';\n" +
                    'export { KbqDl as KbqDlComponent };\n' +
                    'export const lists = { KbqDlComponent: KbqDl };\n'
            );
        });

        it('should rename an old import used as a value when the new class is imported type-only', () => {
            expect(
                migrate(
                    "import type { KbqDl } from '@koobiq/components/dl';\n" +
                        "import { KbqDlComponent } from '@koobiq/components/dl';\n" +
                        'export const imports = [KbqDlComponent];\n' +
                        'export let list: KbqDl;\n'
                )
            ).toBe(
                "import { KbqDl } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl];\n' +
                    'export let list: KbqDl;\n'
            );
        });

        it('should keep the layout of an import whose first name shares the line of the brace', () => {
            expect(
                migrate(
                    "import { KbqDlAlign,\n    KbqDlComponent } from '@koobiq/components/dl';\n" +
                        'export const lists = [KbqDlComponent];\n'
                )
            ).toBe(
                "import { KbqDlAlign,\n    KbqDl } from '@koobiq/components/dl';\n" + 'export const lists = [KbqDl];\n'
            );
        });

        it('should keep the line endings of a file with CRLF', () => {
            expect(
                migrate(
                    "import { KbqDl } from '@koobiq/components/dl';\r\n" +
                        "import { KbqDlComponent } from '@koobiq/components/dl';\r\n" +
                        'export const lists = [KbqDlComponent];\r\n'
                )
            ).toBe("import { KbqDl } from '@koobiq/components/dl';\r\n" + 'export const lists = [KbqDl];\r\n');
        });

        it('should not take a member of Object.prototype for a rename', () => {
            const source = "import * as dl from '@koobiq/components/dl';\n" + 'export const text = dl.toString();\n';

            expect(migrate(source)).toBe(source);
        });

        it('should leave alone what is not imported from the entry point', () => {
            const source =
                "import { KbqDlComponent } from './shared';\n" +
                'class Holder {\n' +
                '    KbqDlComponent = KbqDlComponent;\n' +
                '    read = () => this.KbqDlComponent;\n' +
                '}\n' +
                'export const options = { KbqDlComponent: 1, holder: Holder };\n';

            expect(migrate(source)).toBe(source);
        });

        it('should not rename a member or a key that shares the name of the import', () => {
            expect(
                migrate(
                    "import { KbqDlComponent } from '@koobiq/components/dl';\n" +
                        'export const config = { KbqDlComponent: KbqDlComponent };\n' +
                        'export const read = (holder: { KbqDlComponent: unknown }) => holder.KbqDlComponent;\n'
                )
            ).toBe(
                "import { KbqDl } from '@koobiq/components/dl';\n" +
                    'export const config = { KbqDlComponent: KbqDl };\n' +
                    'export const read = (holder: { KbqDlComponent: unknown }) => holder.KbqDlComponent;\n'
            );
        });
    });

    describe('KbqDlModule', () => {
        it('should replace the module with the three components in an array', () => {
            expect(
                migrate(
                    "import { Component } from '@angular/core';\n" +
                        "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                        '\n' +
                        "@Component({ imports: [KbqDlModule], template: '' })\n" +
                        'export class App {}\n'
                )
            ).toBe(
                "import { Component } from '@angular/core';\n" +
                    "import { KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    '\n' +
                    "@Component({ imports: [KbqDl, KbqDt, KbqDd], template: '' })\n" +
                    'export class App {}\n'
            );
        });

        it('should keep one element per line in a multiline array', () => {
            expect(
                migrate(
                    'import {\n' +
                        '    KbqDlAlign,\n' +
                        '    KbqDlModule\n' +
                        "} from '@koobiq/components/dl';\n" +
                        '\n' +
                        '@NgModule({\n' +
                        '    imports: [\n' +
                        '        CommonModule,\n' +
                        '        KbqDlModule\n' +
                        '    ],\n' +
                        '    exports: [KbqDlModule]\n' +
                        '})\n' +
                        'export class SharedModule {\n' +
                        "    align: KbqDlAlign = 'start';\n" +
                        '}\n'
                )
            ).toBe(
                'import {\n' +
                    "    KbqDlAlign, KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    '\n' +
                    '@NgModule({\n' +
                    '    imports: [\n' +
                    '        CommonModule,\n' +
                    '        KbqDl,\n' +
                    '        KbqDt,\n' +
                    '        KbqDd\n' +
                    '    ],\n' +
                    '    exports: [KbqDl, KbqDt, KbqDd]\n' +
                    '})\n' +
                    'export class SharedModule {\n' +
                    "    align: KbqDlAlign = 'start';\n" +
                    '}\n'
            );
        });

        it('should replace the module in a TestBed configuration', () => {
            expect(
                migrate(
                    "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                        'TestBed.configureTestingModule({ imports: [KbqDlModule, NoopAnimationsModule] });\n'
                )
            ).toBe(
                "import { KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'TestBed.configureTestingModule({ imports: [KbqDl, KbqDt, KbqDd, NoopAnimationsModule] });\n'
            );
        });

        it('should not repeat a component the array already holds', () => {
            expect(
                migrate(
                    "import { KbqDlComponent, KbqDlModule } from '@koobiq/components/dl';\n" +
                        'export const imports = [KbqDlModule, KbqDlComponent];\n'
                )
            ).toBe(
                "import { KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDt, KbqDd, KbqDl];\n'
            );

            expect(
                migrate(
                    "import { KbqDd, KbqDl, KbqDlModule, KbqDt } from '@koobiq/components/dl';\n" +
                        'export const imports = [KbqDl, KbqDt, KbqDd, KbqDlModule];\n'
                )
            ).toBe(
                "import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl, KbqDt, KbqDd];\n'
            );
        });

        it('should replace a module reached through a namespace import', () => {
            expect(
                migrate("import * as dl from '@koobiq/components/dl';\n" + 'export const imports = [dl.KbqDlModule];\n')
            ).toBe(
                "import * as dl from '@koobiq/components/dl';\n" +
                    'export const imports = [dl.KbqDl, dl.KbqDt, dl.KbqDd];\n'
            );
        });

        it('should keep and report a module that is not an element of an array', () => {
            const migrated = migrateSource(
                "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDlModule];\n' +
                    'export const providers = [importProvidersFrom(KbqDlModule)];\n',
                'file.ts'
            );

            expect(migrated.content).toBe(
                "import { KbqDlModule, KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl, KbqDt, KbqDd];\n' +
                    'export const providers = [importProvidersFrom(KbqDlModule)];\n'
            );
            expect(migrated.keptModuleLines).toEqual([3]);
        });

        it('should keep the module import that a local export still names', () => {
            const migrated = migrateSource(
                "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDlModule];\n' +
                    'export { KbqDlModule };\n',
                'file.ts'
            );

            expect(migrated.content).toBe(
                "import { KbqDlModule, KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl, KbqDt, KbqDd];\n' +
                    'export { KbqDlModule };\n'
            );
            expect(migrated.keptModuleLines).toEqual([3]);
        });

        it('should make a type-only import of a component a value import before using it as one', () => {
            expect(
                migrate(
                    "import type { KbqDl } from '@koobiq/components/dl';\n" +
                        "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                        'export const imports = [KbqDlModule];\n' +
                        'export let list: KbqDl;\n'
                )
            ).toBe(
                "import { KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl, KbqDt, KbqDd];\n' +
                    'export let list: KbqDl;\n'
            );
        });

        it('should add the components once for a module repeated in one array', () => {
            expect(
                migrate(
                    "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                        'export const imports = [KbqDlModule, CommonModule, KbqDlModule];\n'
                )
            ).toBe(
                "import { KbqDl, KbqDt, KbqDd } from '@koobiq/components/dl';\n" +
                    'export const imports = [KbqDl, KbqDt, KbqDd, CommonModule];\n'
            );
        });

        it('should leave an import of the module nothing uses', () => {
            const source = "import { KbqDlModule } from '@koobiq/components/dl';\n";

            expect(migrate(source)).toBe(source);
        });
    });

    it('should be idempotent', () => {
        const source =
            "import { KbqDlComponent, KbqDlModule } from '@koobiq/components/dl';\n" +
            'export const imports = [KbqDlModule];\n' +
            'export let list: KbqDlComponent;\n' +
            'export const providers = [importProvidersFrom(KbqDlModule)];\n';
        const once = migrate(source);

        expect(migrate(once)).toBe(once);
    });

    describe('schematic', () => {
        let runner: SchematicTestRunner;
        let appTree: Tree;
        let projects: workspaces.ProjectDefinitionCollection;
        let messages: string[];

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });
            projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;
            messages = [];
            runner.logger.subscribe((entry) => messages.push(entry.message));
        });

        const firstTsPath = (): string => {
            const [first] = projects.keys();
            const root = `/${projects.get(first)!.root}/src/app`;

            return appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        };

        const run = (options: Partial<Schema> = {}): Promise<Tree> => {
            const [first] = projects.keys();

            return runner.runSchematic(SCHEMATIC_NAME, { project: first, ...options } satisfies Schema, appTree);
        };

        const source =
            "import { Component } from '@angular/core';\n" +
            "import { KbqDlModule } from '@koobiq/components/dl';\n" +
            '\n' +
            "@Component({ selector: 'app-root', imports: [KbqDlModule], template: '' })\n" +
            'export class App {}\n';

        it('should rewrite the project files and summarize', async () => {
            appTree.overwrite(firstTsPath(), source);

            expect((await run()).readText(firstTsPath())).toContain('imports: [KbqDl, KbqDt, KbqDd]');
            expect(messages.join('\n')).toContain('updated 1 file(s)');
        });

        it('should only report with fix off', async () => {
            appTree.overwrite(firstTsPath(), source);

            expect((await run({ fix: false })).readText(firstTsPath())).toBe(source);
            expect(messages.join('\n')).toContain('would update');
        });

        it('should report a module it keeps', async () => {
            appTree.overwrite(
                firstTsPath(),
                "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                    'export const providers = [importProvidersFrom(KbqDlModule)];\n'
            );

            await run();

            expect(messages.join('\n')).toContain('Line 2: KbqDlModule is kept');
        });

        it('should stay silent in a project that does not use the description list', async () => {
            await run();

            expect(messages.filter((message) => message.includes('[dl-standalone-names]'))).toEqual([]);
        });
    });
});
