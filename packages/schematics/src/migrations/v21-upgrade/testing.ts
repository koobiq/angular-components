import { JsonValue, workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');

/** The result of a v21-upgrade run over files written into a fresh application. */
export interface V21UpgradeRun {
    /** The content of a file the run was given, by the same name. */
    read(name: string): string;
    /** Everything the migration logged. */
    log: string;
    /** The `styles` of the application's `build` target in `angular.json` after the run. */
    buildStyles(): JsonValue[];
}

/**
 * Writes `files` (name → content, e.g. `{ 'app.ts': '…', 'app.html': '…' }`) into `src/app` of a fresh
 * application, and `buildStyles` into the `styles` of its `build` target, and runs v21-upgrade over it.
 */
export async function runV21Upgrade(
    files: Record<string, string>,
    options: Partial<Schema> = {},
    buildStyles?: JsonValue[]
): Promise<V21UpgradeRun> {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const appTree: Tree = await createTestApp(runner, { style: 'scss' });
    const projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;
    const [project] = projects.keys();
    const root = `/${projects.get(project)!.root}/src/app`;
    const messages: string[] = [];

    for (const [name, content] of Object.entries(files)) {
        const filePath = `${root}/${name}`;

        if (appTree.exists(filePath)) appTree.overwrite(filePath, content);
        else appTree.create(filePath, content);
    }

    if (buildStyles) {
        const workspace = JSON.parse(appTree.readText('/angular.json'));

        workspace.projects[project].architect.build.options.styles = buildStyles;
        appTree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    }

    runner.logger.subscribe((entry) => messages.push(entry.message));

    const result = await runner.runSchematic(
        'v21-upgrade',
        { project, fix: true, ...options } satisfies Schema,
        appTree
    );

    return {
        read: (name) => result.readText(`${root}/${name}`),
        log: messages.join('\n'),
        buildStyles: () => JSON.parse(result.readText('/angular.json')).projects[project].architect.build.options.styles
    };
}
