import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { iconsMapping } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'deprecated-icons';
const DEPRECATED_SCOPE = 'pt-icons';
const [firstIcon, secondIcon] = iconsMapping;

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.{ts,html}` ↔ `app.{ts,html}`). `createTestApp` pins to v17.
 */
const projectPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        html: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        ts: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
        styles: `/${project.root}/src/styles.scss`
    };
};

const getProjectContent = (tree: UnitTestTree | Tree, project: workspaces.ProjectDefinition) => {
    const p = projectPaths(project, tree);

    return [
        tree.read(p.html)?.toString() || '',
        tree.read(p.ts)?.toString() || '',
        tree.read(p.styles)?.toString() || ''
    ].filter(Boolean);
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    describe('icon name & scope migration', () => {
        const elementsWithDeprecatedSelectors = iconsMapping.map(
            ({ replace }) => `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}"></i>`
        );

        const cssClassesWithDeprecatedSelectors = iconsMapping
            .slice(0, 5)
            .map(({ replace }) => `.${DEPRECATED_SCOPE}-${replace} {}`)
            .join('\n');

        // Inline templates only support single-line strings/no-substitution template literals —
        // backticks are used here (not single quotes) so this fixture is valid TypeScript.
        const componentClass = `
@Component({
    selector: 'test-app',
    template: \`${elementsWithDeprecatedSelectors.slice(0, 5).join('\n')}\`
})
class TestApp {
    dynamicClass = '${DEPRECATED_SCOPE}-${firstIcon.replace}';
}`;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            projects.forEach((project) => {
                const p = projectPaths(project, appTree);

                appTree.overwrite(p.html, elementsWithDeprecatedSelectors.join('\n'));
                appTree.overwrite(p.styles, cssClassesWithDeprecatedSelectors);
                appTree.overwrite(p.ts, componentClass);
            });
        });

        it('should migrate a project scoped by the `project` option', async () => {
            const [firstProjectKey, secondProjectKey] = projects.keys();
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true, project: firstProjectKey }, appTree);

            const [html, ts, styles] = getProjectContent(tree, projects.get(firstProjectKey)!);

            expect(html).not.toContain(DEPRECATED_SCOPE);
            expect(html).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
            expect(ts).toContain(`kbq-icon="kbq-${firstIcon.replaceWith}"`);
            expect(ts).not.toContain(DEPRECATED_SCOPE);
            expect(styles).toContain(`.kbq-${firstIcon.replaceWith}`);
            expect(styles).not.toContain(DEPRECATED_SCOPE);

            // A project that wasn't targeted is left untouched.
            const [untouchedHtml] = getProjectContent(tree, projects.get(secondProjectKey)!);

            expect(untouchedHtml).toContain(DEPRECATED_SCOPE);
        });

        it('should migrate the whole tree when no `project` option is given', async () => {
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

            projects.forEach((project) => {
                const [html] = getProjectContent(tree, project);

                expect(html).not.toContain(DEPRECATED_SCOPE);
            });
        });

        it('should only report deprecated icons, without mutating any files, when fix is false', async () => {
            const [firstProjectKey] = projects.keys();
            const beforeContent = getProjectContent(appTree, projects.get(firstProjectKey)!);
            const messages: string[] = [];

            runner.logger.subscribe(({ message }) => messages.push(message));

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: false, project: firstProjectKey }, appTree);

            expect(getProjectContent(tree, projects.get(firstProjectKey)!)).toEqual(beforeContent);

            const combined = messages.join('\n');

            expect(combined).toContain(`${firstIcon.replace} -> \tkbq-${firstIcon.replaceWith}`);
            expect(combined).toContain(`${secondIcon.replace} -> \tkbq-${secondIcon.replaceWith}`);
        });
    });

    describe('class attribute handling', () => {
        const { replace, replaceWith } = firstIcon;
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        const overwriteProjectData = ({
            html,
            ts,
            styles,
            project,
            tree
        }: {
            html?: string;
            ts?: string;
            styles?: string;
            project: workspaces.ProjectDefinition;
            tree: Tree;
        }) => {
            const p = projectPaths(project, tree);

            tree.overwrite(p.html, html || '');
            tree.overwrite(p.styles, styles || '');
            tree.overwrite(p.ts, ts || '');
        };

        it('drops the sole "pt-icons" token from a class list', async () => {
            const html = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="${DEPRECATED_SCOPE}"></i>`;

            overwriteProjectData({ html, project: currentProject, tree: appTree });

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const [migratedHtml] = getProjectContent(tree, currentProject);

            expect(migratedHtml).toBe(`<i kbq-icon="kbq-${replaceWith}" class=""></i>`);
        });

        it('drops "pt-icons" from the start of a multi-class list', async () => {
            const html = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="${DEPRECATED_SCOPE} layout-column"></i>`;

            overwriteProjectData({ html, project: currentProject, tree: appTree });

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const [migratedHtml] = getProjectContent(tree, currentProject);

            expect(migratedHtml).toBe(`<i kbq-icon="kbq-${replaceWith}" class="layout-column"></i>`);
        });

        it('drops "pt-icons" from the end of a multi-class list', async () => {
            const html = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="layout-column ${DEPRECATED_SCOPE}"></i>`;

            overwriteProjectData({ html, project: currentProject, tree: appTree });

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const [migratedHtml] = getProjectContent(tree, currentProject);

            expect(migratedHtml).toBe(`<i kbq-icon="kbq-${replaceWith}" class="layout-column"></i>`);
        });

        it('leaves an unrelated class untouched even when adjacent to a migrated icon', async () => {
            const html = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="my-pt-icons-widget"></i>`;

            overwriteProjectData({ html, project: currentProject, tree: appTree });

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const [migratedHtml] = getProjectContent(tree, currentProject);

            expect(migratedHtml).toBe(`<i kbq-icon="kbq-${replaceWith}" class="my-pt-icons-widget"></i>`);
        });
    });

    describe('bare string literals', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('strips the scope word and renames the icon suffix in a space-joined string literal', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({ selector: 'test-app', template: '' })
class TestApp {
    getDynamicIcon() {
        return '${DEPRECATED_SCOPE} ${replace}';
    }
}`
            );

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.ts)?.toString()).toContain(`return '${replaceWith}';`);
        });

        it('leaves an unrelated string literal untouched even when it contains the scope word', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `
@Component({ selector: 'test-app', template: '' })
class TestApp {
    getDynamicIcon() {
        return '${DEPRECATED_SCOPE} panel-legacy';
    }
}`;

            appTree.overwrite(p.ts, original);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.ts)?.toString()).toBe(original);
        });

        it('leaves an unrelated string literal that does not mention any known icon untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = `
@Component({ selector: 'test-app', template: '' })
class TestApp {
    route = 'pt-icons-not-a-real-icon-name';
}`;

            appTree.overwrite(p.ts, original);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.ts)?.toString()).toBe(original);
        });
    });

    describe('styles', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('renames the ".pt-icons" scope selector to ".kbq"', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(p.styles, '@mixin test-icon { @extend .pt-icons; }');

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.styles)?.toString()).toBe('@mixin test-icon { @extend .kbq; }');
        });

        it('renames a deprecated icon class selector', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(p.styles, `.${DEPRECATED_SCOPE}-${replace} { width: 16px; }`);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.styles)?.toString()).toBe(`.kbq-${replaceWith} { width: 16px; }`);
        });

        it('leaves an unrelated class selector that merely contains "pt-icons" as a substring untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '.my-widget-pt-icons-preview { color: red; }\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.styles)?.toString()).toBe(original);
        });

        it('leaves the bare scope word untouched inside a comment', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '// pt-icons: legacy, to be removed\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.styles)?.toString()).toBe(original);
        });

        it('leaves an unrelated SCSS variable/import/property value untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const original = '$pt-icons: red;\n@import "pt-icons";\n.a { font-family: pt-icons; }\n';

            appTree.overwrite(p.styles, original);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.styles)?.toString()).toBe(original);
        });

        it('honors a custom `stylesExt` option', async () => {
            const p = projectPaths(currentProject, appTree);
            const lessPath = p.styles.replace(/\.scss$/, '.less');
            const originalScss = appTree.read(p.styles)!.toString();

            appTree.create(lessPath, '.pt-icons { }');

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { project: currentProjectKey, fix: true, stylesExt: '.less' },
                appTree
            );

            expect(tree.read(lessPath)?.toString()).toBe('.kbq { }');
            // The default .scss file is untouched since it wasn't targeted by this run.
            expect(tree.read(p.styles)?.toString()).toBe(originalScss);
        });
    });

    describe('dynamic bindings', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;
        let messages: string[];

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
            messages = [];
            runner.logger.subscribe(({ message }) => messages.push(message));
        });

        it('warns and leaves a bound, non-literal icon attribute value untouched', async () => {
            const p = projectPaths(currentProject, appTree);
            const html = '<i [kbq-icon]="iconVar"></i>';

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.html)?.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('warns and leaves a concatenation expression untouched, instead of corrupting it', async () => {
            const { replace } = firstIcon;
            const p = projectPaths(currentProject, appTree);
            const html = `<i [kbq-icon]="'${DEPRECATED_SCOPE}-' + name + '${replace}'"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.html)?.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('warns and leaves an interpolated value untouched, instead of corrupting it', async () => {
            const p = projectPaths(currentProject, appTree);
            const html = `<i kbq-icon="${DEPRECATED_SCOPE}-{{ name }}"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.html)?.toString()).toBe(html);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(true);
        });

        it('migrates a quoted string literal bound to an icon attribute, preserving its quotes', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);
            const html = `<i [kbq-icon]="'${DEPRECATED_SCOPE}-${replace}'"></i>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.html)?.toString()).toBe(`<i [kbq-icon]="'kbq-${replaceWith}'"></i>`);
            expect(messages.some((message) => message.includes('change value on your own'))).toBe(false);
        });
    });

    describe('ICU expansions', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('migrates an icon used inside an ICU expansion case', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);
            const html = `<span>{count, plural, =1 {<i kbq-icon="${DEPRECATED_SCOPE}-${replace}"></i>} other {none}}</span>`;

            appTree.overwrite(p.html, html);

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(tree.read(p.html)?.toString()).toBe(
                `<span>{count, plural, =1 {<i kbq-icon="kbq-${replaceWith}"></i>} other {none}}</span>`
            );
        });
    });

    describe('inline host & styles', () => {
        let currentProject: workspaces.ProjectDefinition;
        let currentProjectKey: string;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);

            projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value!;
            currentProject = projects.get(currentProjectKey)!;
        });

        it('migrates the host class string and renames a `[class.<icon-name>]` host binding', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({
    selector: 'test-app',
    template: '',
    host: { class: '${DEPRECATED_SCOPE}', '[class.${DEPRECATED_SCOPE}-${replace}]': 'true' }
})
class TestApp {}`
            );

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const ts = tree.read(p.ts)?.toString() || '';

            expect(ts).toContain("class: ''");
            expect(ts).toContain(`class.kbq-${replaceWith}`);
        });

        it('drops a bare-scope `[class.X]` host binding, since it has nothing to rename to', async () => {
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({
    selector: 'test-app',
    template: '',
    host: { class: '${DEPRECATED_SCOPE}', '[class.${DEPRECATED_SCOPE}]': 'true' }
})
class TestApp {}`
            );

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const ts = tree.read(p.ts)?.toString() || '';

            expect(ts).toContain("class: ''");
            expect(ts).not.toContain(`class.${DEPRECATED_SCOPE}`);
        });

        it('migrates a selector inside an inline `styles` array, boundary-safe', async () => {
            const { replace, replaceWith } = firstIcon;
            const p = projectPaths(currentProject, appTree);

            appTree.overwrite(
                p.ts,
                `
@Component({
    selector: 'test-app',
    template: '',
    styles: ['.${DEPRECATED_SCOPE}-${replace} { width: 16px; } .my-widget-${DEPRECATED_SCOPE}-preview { color: red; }']
})
class TestApp {}`
            );

            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);
            const ts = tree.read(p.ts)?.toString() || '';

            expect(ts).toContain(`.kbq-${replaceWith} { width: 16px; }`);
            expect(ts).toContain(`.my-widget-${DEPRECATED_SCOPE}-preview { color: red; }`);
        });
    });
});
