import { workspaces } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import * as messages from './messages';
import { visitProjectFiles } from './project-files';

/**
 * Sorts the keys of the given object.
 * @returns A new object instance with sorted keys
 */
function sortObjectByKeys(obj: Record<string, string>) {
    return Object.keys(obj)
        .sort()
        .reduce<Record<string, string>>((result, key) => {
            result[key] = obj[key];

            return result;
        }, {});
}

/**
 * Adds a package to the package.json in the given tree
 */
export function addPackageToPackageJson(tree: Tree, pkg: string, version: string, devDependency = false): Tree {
    if (tree.exists('package.json')) {
        const sourceText = tree.read('package.json')!.toString('utf-8');
        const json = JSON.parse(sourceText);

        const dependenciesType = devDependency ? 'devDependencies' : 'dependencies';
        const dependencies = json[dependenciesType] || {};

        if (!dependencies[pkg]) {
            dependencies[pkg] = version;
            json[dependenciesType] = sortObjectByKeys(dependencies);
        }

        tree.overwrite('package.json', JSON.stringify(json, null, 2));
    }

    return tree;
}

/**
 * Gets the version of the specified package by looking at the package.json in the given tree
 */
export function getPackageVersionFromPackageJson(
    tree: Tree,
    name: string,
    includeDevDependencies = false
): string | null {
    if (!tree.exists('package.json')) {
        return null;
    }

    const packageJson = JSON.parse(tree.read('package.json')!.toString('utf8'));

    if (packageJson.dependencies && packageJson.dependencies[name]) {
        return packageJson.dependencies[name];
    }

    if (includeDevDependencies && packageJson.devDependencies && packageJson.devDependencies[name]) {
        return packageJson.devDependencies[name];
    }

    return null;
}

export async function setupOptions(
    project: string | undefined,
    tree: Tree
): Promise<workspaces.ProjectDefinition | undefined | never> {
    if (project) {
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(project);

        if (!projectWorkspace) {
            throw new SchematicsException(messages.noProject(project));
        }

        return projectWorkspace as unknown as workspaces.ProjectDefinition;
    }

    return undefined;
}

export async function getParsingInfo(project: string | undefined, tree: Tree) {
    const tsPaths = new Set<string>();
    const templatePaths = new Set<string>();
    const projectDefinition = await setupOptions(project, tree);
    // `ng update` passes no options at all, so without a project the whole workspace is migrated.
    const root = projectDefinition?.root;

    visitProjectFiles(root ? tree.getDir(root) : tree.root, (filePath: string) => {
        if (filePath.endsWith('.ts')) {
            tsPaths.add(filePath);
        }

        if (filePath.endsWith('.html')) {
            templatePaths.add(filePath);
        }
    });

    return { tsPaths, templatePaths, projectDefinition };
}
