import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tag-slots';

const getProjectContentPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        templatePath: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        tsPath: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`
    };
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;
    let projectKey: string;

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

    it('should run for a specified project', async () => {
        await runner.runSchematic(SCHEMATIC_NAME, { project: projectKey, fix: true } satisfies Schema, appTree);
    });

    it('should mark every legacy tag icon as prefix regardless of source order', async () => {
        const result = await migrateTemplate(
            '<kbq-tag><i kbq-icon="kbq-plus_16"></i>Tag<i kbq-icon="kbq-chevron-down-s_16"></i></kbq-tag>'
        );

        expect(result).toContain('<i kbqTagPrefix kbq-icon="kbq-plus_16">');
        expect(result).toContain('<i kbqTagPrefix kbq-icon="kbq-chevron-down-s_16">');
        expect(result).not.toContain('kbqTagSuffix kbq-icon');
    });

    it.each([
        '<kbq-tag><i kbq-icon></i>Tag</kbq-tag>',
        '<div kbq-tag><i [kbq-icon]="icon"></i>Tag</div>',
        '<kbq-basic-tag><i kbq-icon></i>Tag</kbq-basic-tag>',
        '<div kbq-basic-tag><i kbq-icon></i>Tag</div>'
    ])('should support every tag and icon selector in %s', async (template) => {
        expect(await migrateTemplate(template)).toContain('kbqTagPrefix');
    });

    it.each([
        '<kbq-tag><i kbq-icon-button></i>Tag</kbq-tag>',
        '<kbq-tag><i kbq-icon-item></i>Tag</kbq-tag>'
    ])('should leave icon selectors outside the legacy projection slot unchanged in %s', async (template) => {
        expect(await migrateTemplate(template)).toBe(template);
    });

    it('should leave semantic and explicit slot icons unchanged', async () => {
        const template = `
            <kbq-tag>
                <i kbqTagPrefix kbq-icon></i>
                <i kbqTagSuffix kbq-icon></i>
                <i kbqTagRemove kbq-icon></i>
                <i kbqTagEditSubmit kbq-icon></i>
            </kbq-tag>
        `;

        expect(await migrateTemplate(template)).toBe(template);
    });

    it('should migrate icons inside control-flow blocks and ng-container', async () => {
        const result = await migrateTemplate(`
            <kbq-tag>
                @if (showFirst()) { <i kbq-icon="first"></i> }
                @if (showMore()) {
                    <i kbq-icon="second"></i>
                    <i kbq-icon="third"></i>
                }
                <ng-container><i kbq-icon="fourth"></i></ng-container>
                Tag
            </kbq-tag>
        `);

        expect(result.match(/kbqTagPrefix/g)).toHaveLength(4);
    });

    it('should not migrate an icon nested in a regular consumer wrapper', async () => {
        const template = '<kbq-tag><span><i kbq-icon></i></span>Tag</kbq-tag>';

        expect(await migrateTemplate(template)).toBe(template);
    });

    it('should not migrate an icon whose projection is overridden with ngProjectAs', async () => {
        const template = '<kbq-tag><i kbq-icon ngProjectAs="custom-slot"></i>Tag</kbq-tag>';

        expect(await migrateTemplate(template)).toBe(template);
    });

    it('should leave icons outside tags unchanged', async () => {
        const template = '<div><i kbq-icon></i>Text</div>';

        expect(await migrateTemplate(template)).toBe(template);
    });

    it('should be idempotent', async () => {
        const once = await migrateTemplate('<kbq-tag>Tag<i kbq-icon></i></kbq-tag>');

        expect(await migrateTemplate(once)).toBe(once);
    });

    it('should migrate a static inline template', async () => {
        const { tsPath } = getProjectContentPaths(projects.get(projectKey)!, appTree);

        appTree.overwrite(
            tsPath,
            'import { Component } from "@angular/core";\n' +
                '@Component({ template: `<kbq-tag>Tag<i kbq-icon></i></kbq-tag>` })\n' +
                'export class App {}\n'
        );

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: projectKey, fix: true } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(tsPath)!.toString()).toContain('<i kbqTagPrefix kbq-icon>');
    });

    it('should not write with fix=false', async () => {
        const template = '<kbq-tag>Tag<i kbq-icon></i></kbq-tag>';

        expect(await migrateTemplate(template, { fix: false })).toBe(template);
    });
});
