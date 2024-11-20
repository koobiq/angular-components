import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectDefinition } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { iconsMapping } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'deprecated-icons';
const DEPRECATED_SCOPE = 'pt-icons';

const getProjectContent = (tree: UnitTestTree | Tree, project: ProjectDefinition) => {
    return [
        tree.read(`/${project.root}/src/app/app.component.html`)?.toString() || '',
        tree.read(`/${project.root}/src/app/app.component.ts`)?.toString() || '',
        tree.read(`/${project.root}/src/styles.scss`)?.toString() || ''
    ].filter(Boolean);
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: ProjectDefinitionCollection;

    describe('icons mapping', () => {
        const elementsWithDeprecatedSelectors = iconsMapping.map(
            ({ replace }) => `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}"></i>`
        );

        const cssClassesWithDeprecatedSelectors = iconsMapping
            .slice(0, 5)
            .map(({ replace }) => `.${DEPRECATED_SCOPE}-${replace} {}`)
            .join('\n');

        const componentClass = `
@Component({
    selector: 'test-app',
    template: '${elementsWithDeprecatedSelectors.slice(0, 5).join('\n')}'
})
class TestApp {
    dynamicClass = '${DEPRECATED_SCOPE}-${iconsMapping[0].replace}';
}`;

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);
            projects = workspace.projects as unknown as ProjectDefinitionCollection;
            projects.forEach((project) => {
                const templatePath = `/${project.root}/src/app/app.component.html`;
                const tsPath = `/${project.root}/src/app/app.component.ts`;
                const stylesPath = `/${project.root}/src/styles.scss`;

                appTree.overwrite(templatePath, elementsWithDeprecatedSelectors.join('\n'));
                appTree.overwrite(stylesPath, cssClassesWithDeprecatedSelectors);
                appTree.overwrite(tsPath, componentClass);
            });
        });

        it('should run migration for specified project', async () => {
            const [firstProjectKey] = projects.keys();
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true, project: firstProjectKey }, appTree);

            expect(getProjectContent(tree, projects.get(firstProjectKey)!)).toMatchSnapshot(
                `project ${firstProjectKey}: after changes`
            );
        });

        it('should inform about deprecated icons for fix = false (default, without params)', async () => {
            const [firstProjectKey] = projects.keys();
            const messages: string[] = [];
            runner.logger.subscribe(
                ({ message }) => {
                    messages.push(message);
                    expect(message).toBeTruthy();
                },
                () => {},
                () => expect(messages).toMatchSnapshot()
            );

            try {
                await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey }, appTree);
            } finally {
                runner.logger.complete();
            }
        });
    });

    describe('class replacements in styles, template, typescript', () => {
        const { replace } = iconsMapping[0];
        let currentProject: ProjectDefinition;
        let currentProjectKey: string;
        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });

            const workspace = await getWorkspace(appTree);
            projects = workspace.projects as unknown as ProjectDefinitionCollection;
            currentProjectKey = projects.keys().next().value;
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
            project: ProjectDefinition;
            tree: Tree;
        }) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;
            const tsPath = `/${project.root}/src/app/app.component.ts`;
            const stylesPath = `/${project.root}/src/styles.scss`;

            tree.overwrite(templatePath, html || '');
            tree.overwrite(stylesPath, styles || '');
            tree.overwrite(tsPath, ts || '');
        };

        it('should replace "class="pt-icons"" with ""', async () => {
            const elementWithDeprecatedSelector = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="${DEPRECATED_SCOPE}"></i>`;

            const componentClass = `
            @Component({
                selector: 'test-app',
                template: '${elementWithDeprecatedSelector}'
            })
            class TestApp {}`;

            overwriteProjectData({
                html: elementWithDeprecatedSelector,
                ts: componentClass,
                project: currentProject,
                tree: appTree
            });
            expect(getProjectContent(appTree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: before changes`
            );
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(getProjectContent(tree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: after changes`
            );
        });

        it('should replace "class="pt-icons " with "class=""', async () => {
            const elementWithDeprecatedSelector = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="${DEPRECATED_SCOPE} layout-column"></i>`;
            overwriteProjectData({
                html: elementWithDeprecatedSelector,
                project: currentProject,
                tree: appTree
            });

            expect(getProjectContent(appTree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: before changes`
            );
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(getProjectContent(tree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: after changes`
            );
        });

        it('should replace " pt-icons"" with """', async () => {
            const elementWithDeprecatedSelector = `<i kbq-icon="${DEPRECATED_SCOPE}-${replace}" class="layout-column ${DEPRECATED_SCOPE}"></i>`;
            overwriteProjectData({
                html: elementWithDeprecatedSelector,
                project: currentProject,
                tree: appTree
            });

            expect(getProjectContent(appTree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: before changes`
            );
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(getProjectContent(tree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: after changes`
            );
        });

        it('should replace "\'pt-icons " with "\'"', async () => {
            const componentClass = `
            @Component({
                selector: 'test-app',
                template: ''
            })
            class TestApp {
                getDynamicIcon() {
                   return '${DEPRECATED_SCOPE} ${replace}';
                }
            }`;
            overwriteProjectData({
                ts: componentClass,
                project: currentProject,
                tree: appTree
            });

            expect(getProjectContent(appTree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: before changes`
            );
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(getProjectContent(tree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: after changes`
            );
        });

        it('should replace ".pt-icons" with ".kbq"', async () => {
            const styles = `
                @mixin test-icon { @extend .pt-icons; }
            `;
            overwriteProjectData({
                styles,
                project: currentProject,
                tree: appTree
            });

            expect(getProjectContent(appTree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: before changes`
            );
            const tree = await runner.runSchematic(SCHEMATIC_NAME, { project: currentProjectKey, fix: true }, appTree);

            expect(getProjectContent(tree, currentProject)).toMatchSnapshot(
                `project ${currentProjectKey}: after changes`
            );
        });
    });
});
