import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { newIconsPackData } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'new-icons-pack';

const bareSuffix = (value: string) => value.replace(/^kbq-/, '');
const [firstIcon, secondIcon] = newIconsPackData
    .filter(({ replace, replaceWith }) => replace !== replaceWith)
    .map(({ replace, replaceWith }) => ({ replace: bareSuffix(replace), replaceWith: bareSuffix(replaceWith) }));

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.html` ↔ `app.html`). `createTestApp` pins to v17, so the
 * default is `app.component.html` — but pick whichever the generator produced.
 */
const projectPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        html: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        ts: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
        styles: `/${project.root}/src/styles.scss`
    };
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
    });

    describe('icon prefix & name migration', () => {
        const elementsWithDeprecatedIconPrefixes = [
            `<i kbq-icon="mc-${firstIcon.replace}"></i>`,
            `<i kbq-icon-item="mc-${firstIcon.replace}"></i>`,
            `<i kbq-icon-button="mc-${firstIcon.replace}"></i>`,
            `<i class="mc kbq-icon mc-${firstIcon.replace}"></i>`,
            `<div [class.mc-${firstIcon.replace}]="true"></div>`
        ];

        beforeEach(() => {
            projects.forEach((project) => {
                const p = projectPaths(project, appTree);

                appTree.overwrite(
                    p.html,
                    `${appTree.read(p.html)!.toString()}\n${elementsWithDeprecatedIconPrefixes.join('\n')}`
                );
                appTree.overwrite(p.styles, `@use "@koobiq/icons"\n.mc-${firstIcon.replace} {}\n`);
            });
        });

        it('migrates a project scoped by the `project` option, leaving others untouched', async () => {
            const [firstProjectKey, secondProjectKey] = projects.keys();
            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = tree.read(p.html)!.toString();

            expect(html).not.toContain('mc-');
            expect(html).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
            expect(html).toContain(`kbq-icon-item="kbq-${firstIcon.replaceWith}"`);
            expect(html).toContain(`kbq-icon-button="kbq-${firstIcon.replaceWith}"`);
            expect(html).toContain(`class="kbq kbq-icon kbq-${firstIcon.replaceWith}"`);
            expect(html).toContain(`[class.kbq-${firstIcon.replaceWith}]="true"`);

            const secondP = projectPaths(projects.get(secondProjectKey)!, appTree);
            const untouchedHtml = tree.read(secondP.html)!.toString();

            elementsWithDeprecatedIconPrefixes.forEach((el) => expect(untouchedHtml).toContain(el));
        });

        it('migrates the whole tree when no `project` option is given', async () => {
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true, updatePrefix: true }, appTree);

            projects.forEach((project) => {
                const p = projectPaths(project, appTree);
                const html = tree.read(p.html)!.toString();

                elementsWithDeprecatedIconPrefixes.forEach((el) => expect(html).not.toContain(el));
            });
        });

        it('only reports deprecated icons, without mutating any files, when fix is false', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const beforeHtml = appTree.read(p.html)!.toString();
            const messages: string[] = [];

            runner.logger.subscribe(({ message }) => messages.push(message));

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: false, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(beforeHtml);

            const combined = messages.join('\n');

            expect(combined).toContain(`mc-${firstIcon.replace} -> \tkbq-${firstIcon.replaceWith}`);
        });
    });

    describe('unrelated tokens (regression)', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(() => {
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('leaves an unrelated component selector untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `${appTree.read(p.html)!.toString()}\n<mc-button>legacy</mc-button>\n`;

            appTree.overwrite(p.html, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(original);
        });

        it('leaves an unrelated `[class.X]` binding untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `${appTree.read(p.html)!.toString()}\n<div [class.mc-legacy-flag]="isLegacy"></div>\n`;

            appTree.overwrite(p.html, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(original);
        });

        it('leaves an unrelated string literal untouched, in an HTML comment', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `${appTree.read(p.html)!.toString()}\n<!-- 'mc-legacy-mode' -->\n`;

            appTree.overwrite(p.html, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(original);
        });

        it('leaves an unrelated bare TS string literal untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `${appTree.read(p.ts)!.toString()}\nexport const mode = 'mc-legacy-mode';\n`;

            appTree.overwrite(p.ts, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.ts)!.toString()).toBe(original);
        });

        it('leaves an unrelated CSS class untouched in styles', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '.mc-panel-header { color: red; }\n.my-mc-widget { color: blue; }\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.styles)!.toString()).toBe(original);
        });

        it('leaves an unrelated SCSS variable/import/property value untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '$mc: red;\n@import "mc";\n.a { font-family: mc; }\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.styles)!.toString()).toBe(original);
        });

        it('leaves an unrelated Markdown file untouched', async () => {
            const mdPath = `/${currentProject.root}/README.md`;
            const original = 'The mc compiler is unrelated; some projects use mc as an abbreviation.\n';

            appTree.create(mdPath, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(mdPath)!.toString()).toBe(original);
        });
    });

    describe('already-migrated scope (regression)', () => {
        it('still renames an icon whose prefix was already swapped to "kbq-" by an earlier run', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);

            appTree.overwrite(
                p.html,
                `<i kbq-icon="kbq-${firstIcon.replace}"></i>\n` +
                    `<i class="kbq kbq-icon kbq-${firstIcon.replace}"></i>`
            );
            appTree.overwrite(p.styles, `.kbq-${firstIcon.replace} { width: 16px; }`);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            const html = tree.read(p.html)!.toString();

            expect(html).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
            expect(html).toContain(`class="kbq kbq-icon kbq-${firstIcon.replaceWith}"`);
            expect(tree.read(p.styles)!.toString()).toBe(`.kbq-${firstIcon.replaceWith} { width: 16px; }`);
        });

        it('does not report an icon that is already fully migrated as a no-op change', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = `<i kbq-icon="kbq-${firstIcon.replaceWith}"></i>`;
            const messages: string[] = [];

            appTree.overwrite(p.html, html);
            runner.logger.subscribe(({ message }) => messages.push(message));

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(html);
            expect(messages.join('\n')).not.toContain(firstIcon.replaceWith);
        });
    });

    describe('dynamic bindings', () => {
        let messages: string[];

        beforeEach(() => {
            messages = [];
            runner.logger.subscribe(({ message }) => messages.push(message));
        });

        it('warns and leaves a bound, non-literal icon attribute value untouched', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = '<i [kbq-icon]="iconVar"></i>';

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('warns and leaves a concatenation expression untouched, instead of corrupting it', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = `<i [kbq-icon]="'mc-' + name + '${firstIcon.replace}'"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('warns and leaves an interpolated value untouched, instead of corrupting it', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = `<i kbq-icon="mc-{{ name }}"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('migrates a quoted string literal bound to an icon attribute, preserving its quotes', async () => {
            const [firstProjectKey] = projects.keys();
            const p = projectPaths(projects.get(firstProjectKey)!, appTree);
            const html = `<i [kbq-icon]="'mc-${firstIcon.replace}'"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: firstProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(`<i [kbq-icon]="'kbq-${firstIcon.replaceWith}'"></i>`);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(false);
        });
    });

    describe('styles', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(() => {
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('renames a deprecated icon class selector when `updatePrefix` is true', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(p.styles, `.mc-${firstIcon.replace} { width: 16px; }`);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.styles)!.toString()).toBe(`.kbq-${firstIcon.replaceWith} { width: 16px; }`);
        });

        it('leaves an unrelated bare "mc" selector/variable untouched when `updatePrefix` is false', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '.mc { width: 16px; }\n$mc: red;\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: false },
                appTree
            );

            expect(tree.read(p.styles)!.toString()).toBe(original);
        });

        it('still renames a deprecated icon class selector when `updatePrefix` is false', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(p.styles, `.mc-${firstIcon.replace} { width: 16px; }`);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: false },
                appTree
            );

            expect(tree.read(p.styles)!.toString()).toBe(`.kbq-${firstIcon.replaceWith} { width: 16px; }`);
        });
    });

    describe('customDataPath & customIconReplacementPath', () => {
        let tmpDir: string;
        let currentProjectKey: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'new-icons-pack-'));
            currentProjectKey = projects.keys().next().value!;
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it('only applies entries from a custom data file', async () => {
            const customDataPath = path.join(tmpDir, 'custom-migration.json');

            fs.writeFileSync(
                customDataPath,
                JSON.stringify([{ replace: `kbq-${secondIcon.replace}`, replaceWith: `kbq-${secondIcon.replaceWith}` }])
            );

            const p = projectPaths(projects.get(currentProjectKey)!, appTree);

            appTree.overwrite(
                p.html,
                `<i kbq-icon="mc-${firstIcon.replace}"></i>\n<i kbq-icon="mc-${secondIcon.replace}"></i>`
            );

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true, customDataPath },
                appTree
            );

            const html = tree.read(p.html)!.toString();

            // The custom entry's suffix is renamed...
            expect(html).toContain(`kbq-icon="kbq-${secondIcon.replaceWith}"`);
            // ...but a suffix not present in the custom data only gets its scope prefix swapped,
            // not renamed, since it's outside the custom mapping.
            expect(html).toContain(`kbq-icon="kbq-${firstIcon.replace}"`);
        });

        it('accepts the new bare scope-pair shape for a custom icon replacement file', async () => {
            const customIconReplacementPath = path.join(tmpDir, 'custom-replacement.json');

            fs.writeFileSync(customIconReplacementPath, JSON.stringify([{ replace: 'legacy', replaceWith: 'kbq' }]));

            const p = projectPaths(projects.get(currentProjectKey)!, appTree);

            appTree.overwrite(p.html, `<i kbq-icon="legacy-${firstIcon.replace}"></i>`);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true, customIconReplacementPath },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
        });

        it('warns and falls back to the default scope for a legacy-shaped custom icon replacement file', async () => {
            const customIconReplacementPath = path.join(tmpDir, 'legacy-replacement.json');
            const messages: string[] = [];

            fs.writeFileSync(
                customIconReplacementPath,
                JSON.stringify([{ replace: 'kbq-icon="mc-', replaceWith: 'kbq-icon="kbq-' }])
            );

            const p = projectPaths(projects.get(currentProjectKey)!, appTree);

            appTree.overwrite(p.html, `<i kbq-icon="mc-${firstIcon.replace}"></i>`);

            runner.logger.subscribe(({ message }) => messages.push(message));

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true, customIconReplacementPath },
                appTree
            );

            // Falls back to the default 'mc' -> 'kbq' scope, so the default mapping still applies.
            expect(tree.read(p.html)!.toString()).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
            expect(messages.some((message) => message.includes('legacy fragment format'))).toBe(true);
        });

        it('warns and falls back for a malformed custom icon replacement file, instead of crashing', async () => {
            const customIconReplacementPath = path.join(tmpDir, 'malformed-replacement.json');
            const messages: string[] = [];

            fs.writeFileSync(customIconReplacementPath, JSON.stringify([{ replaceWith: 'kbq' }]));

            const p = projectPaths(projects.get(currentProjectKey)!, appTree);

            appTree.overwrite(p.html, `<i kbq-icon="mc-${firstIcon.replace}"></i>`);

            runner.logger.subscribe(({ message }) => messages.push(message));

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true, customIconReplacementPath },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
        });
    });

    describe('inline host & styles', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(() => {
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('migrates the host class string of an inline @Component decorator', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({
    selector: 'test-app',
    template: '',
    host: { class: 'mc mc-${firstIcon.replace}' }
})
class TestApp {}`
            );

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.ts)?.toString()).toContain(`class: 'kbq kbq-${firstIcon.replaceWith}'`);
        });

        it('migrates a selector inside an inline `styles` array, boundary-safe', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({
    selector: 'test-app',
    template: '',
    styles: ['.mc-${firstIcon.replace} { width: 16px; } .my-widget-mc-preview { color: red; }']
})
class TestApp {}`
            );

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );
            const ts = tree.read(p.ts)?.toString() || '';

            expect(ts).toContain(`.kbq-${firstIcon.replaceWith} { width: 16px; }`);
            expect(ts).toContain('.my-widget-mc-preview { color: red; }');
        });

        it('migrates an icon used inside an ICU expansion case', async () => {
            const p = projectPaths(currentProject, appTree);
            const html = `<span>{count, plural, =1 {<i kbq-icon="mc-${firstIcon.replace}"></i>} other {none}}</span>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { fix: true, project: currentProjectKey, updatePrefix: true },
                appTree
            );

            expect(tree.read(p.html)!.toString()).toBe(
                `<span>{count, plural, =1 {<i kbq-icon="kbq-${firstIcon.replaceWith}"></i>} other {none}}</span>`
            );
        });
    });
});
