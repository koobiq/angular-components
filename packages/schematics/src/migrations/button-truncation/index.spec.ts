import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'button-truncation';

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.{ts,html}` ↔ `app.{ts,html}`); pick whichever generator produced.
 */
const getProjectContentPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        templatePath: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        tsPath: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
        stylePath: tree.exists(`${root}/app.scss`) ? `${root}/app.scss` : `${root}/app.component.scss`
    };
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;
    let projectKey: string;

    /** Writes `template` into the project's external template and runs the schematic over it. */
    const migrateTemplate = async (template: string, options: Partial<Schema> = {}) => {
        const { templatePath } = getProjectContentPaths(projects.get(projectKey)!, appTree);

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: projectKey, fix: true, ...options } satisfies Schema,
            appTree
        );

        return updatedTree.read(templatePath)!.toString();
    };

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
        [projectKey] = projects.keys();
    });

    it('should run migration for specified project', async () => {
        await runner.runSchematic(SCHEMATIC_NAME, { project: projectKey, fix: true } satisfies Schema, appTree);
    });

    describe('marker slots', () => {
        it('should mark a leading and a trailing icon', async () => {
            const result = await migrateTemplate(
                '<button kbq-button><i kbq-icon="kbq-plus_16"></i>Text<i kbq-icon="kbq-chevron-down-s_16"></i></button>'
            );

            expect(result).toContain('<i kbqButtonPrefix kbq-icon="kbq-plus_16">');
            expect(result).toContain('<i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16">');
        });

        it('should mark an icon inside kbq-button-toggle', async () => {
            const result = await migrateTemplate(
                '<kbq-button-toggle [value]="1"><i kbq-icon="kbq-briefcase_16"></i>Курьером</kbq-button-toggle>'
            );

            expect(result).toContain('<i kbqButtonPrefix kbq-icon="kbq-briefcase_16">');
        });

        it('should mark an icon rendered by a single-element block', async () => {
            const result = await migrateTemplate(
                '<button kbq-button>@if (showIcon()) {<i kbq-icon="kbq-plus_16"></i>}Text</button>'
            );

            expect(result).toContain('<i kbqButtonPrefix kbq-icon="kbq-plus_16">');
        });

        it('should mark the icon subclasses too', async () => {
            const result = await migrateTemplate('<button kbq-button><i kbq-icon-item></i>Text</button>');

            expect(result).toContain('<i kbqButtonPrefix kbq-icon-item>');
        });

        it('should leave an icon-only button untouched', async () => {
            const template = '<button kbq-button aria-label="Add"><i kbq-icon="kbq-plus_16"></i></button>';

            expect(await migrateTemplate(template)).toBe(template);
        });

        it('should leave a pair of icons with no label untouched', async () => {
            const template =
                '<button kbq-button aria-label="Sort"><i kbq-icon="kbq-plus_16"></i><i kbq-icon="kbq-minus_16"></i></button>';

            expect(await migrateTemplate(template)).toBe(template);
        });

        it('should leave an icon that is not at either edge untouched', async () => {
            const template = '<button kbq-button>Text<i kbq-icon="kbq-plus_16"></i>More</button>';

            expect(await migrateTemplate(template)).toBe(template);
        });

        it('should leave an icon nested in a consumer wrapper untouched', async () => {
            const template = '<button kbq-button><span><i kbq-icon="kbq-plus_16"></i></span>Text</button>';

            expect(await migrateTemplate(template)).toBe(template);
        });

        it('should leave a non-button element untouched', async () => {
            const template = '<div><i kbq-icon="kbq-plus_16"></i>Text</div>';

            expect(await migrateTemplate(template)).toBe(template);
        });

        it('should be idempotent', async () => {
            const once = await migrateTemplate('<button kbq-button><i kbq-icon="kbq-plus_16"></i>Text</button>');
            const twice = await migrateTemplate(once);

            expect(twice).toBe(once);
        });

        it('should migrate an inline template', async () => {
            const { tsPath } = getProjectContentPaths(projects.get(projectKey)!, appTree);

            appTree.overwrite(
                tsPath,
                'import { Component } from "@angular/core";\n' +
                    '@Component({ template: `<button kbq-button><i kbq-icon="kbq-plus_16"></i>Text</button>` })\n' +
                    'export class App {}\n'
            );

            const updatedTree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { project: projectKey, fix: true } satisfies Schema,
                appTree
            );

            expect(updatedTree.read(tsPath)!.toString()).toContain('<i kbqButtonPrefix kbq-icon="kbq-plus_16">');
        });

        it('should not write anything with fix=false', async () => {
            const template = '<button kbq-button><i kbq-icon="kbq-plus_16"></i>Text</button>';

            expect(await migrateTemplate(template, { fix: false })).toBe(template);
        });
    });

    describe('stylesheet report', () => {
        const runOverStyles = async (styles: string) => {
            const { stylePath } = getProjectContentPaths(projects.get(projectKey)!, appTree);
            const warnings: string[] = [];

            runner.logger.subscribe(({ message }) => warnings.push(message));

            appTree.overwrite(stylePath, styles);

            const updatedTree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { project: projectKey, fix: true } satisfies Schema,
                appTree
            );

            return { warnings: warnings.join('\n'), content: updatedTree.read(stylePath)!.toString() };
        };

        it.each([
            ['.kbq-button-text', '::ng-deep .kbq-button-text { display: flex; }'],
            ['.kbq-button-wrapper', '::ng-deep .kbq-button-wrapper { text-overflow: ellipsis; }'],
            ['.kbq-button-toggle-wrapper', '::ng-deep .kbq-button-toggle-wrapper { display: block; }']
        ])('should report an override of %s without rewriting it', async (selector, styles) => {
            const { warnings, content } = await runOverStyles(styles);

            expect(warnings).toContain(selector);
            // the right fix depends on why the override exists, so the file is never touched
            expect(content).toBe(styles);
        });

        it('should always note the max-width change', async () => {
            const { warnings } = await runOverStyles('.unrelated { color: red; }');

            expect(warnings).toContain('max-width: 100%');
            expect(warnings).toContain('max-width: none');
        });
    });
});
