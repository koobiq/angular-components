import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { ProjectDefinition, readWorkspace } from '@schematics/angular/utility';
import * as messages from './messages';

/**
 * Sorts the keys of the given object.
 * @returns A new object instance with sorted keys
 */
function sortObjectByKeys(obj: Record<string, string>) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => (result[key] = obj[key]) && result, {});
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
): Promise<ProjectDefinition | undefined | never> {
    if (project) {
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(project);

        if (!projectWorkspace) {
            throw new SchematicsException(messages.noProject(project));
        }

        return projectWorkspace;
    }
}

export async function getParsingInfo(project: string | undefined, tree: Tree) {
    const tsPaths = new Set<string>();
    const templatePaths = new Set<string>();
    const projectDefinition = await setupOptions(project, tree);
    if (!projectDefinition) {
        throw new SchematicsException(messages.noProject('no project'));
    }

    tree.getDir(projectDefinition.root).visit((filePath: string) => {
        if (filePath.endsWith('.ts')) {
            tsPaths.add(filePath);
        }

        if (filePath.endsWith('.html')) {
            templatePaths.add(filePath);
        }
    });

    return { tsPaths, templatePaths, projectDefinition };
}

/**
 * WARNING: do not change directly, since it's a copy of
 * https://github.com/angular/angular/blob/6fa8d441979fdbabb88dddd246f54587e17126e8/packages/core/schematics/utils/load_esm.ts
 *
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 * This is only intended to be used with Angular framework packages.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
export async function loadEsmModule<T>(modulePath: string | URL): Promise<T> {
    const namespaceObject = await new Function('modulePath', `return import(modulePath);`)(modulePath);

    // If it is not ESM then the values needed will be stored in the `default` property.
    // TODO_ESM: This can be removed once `@angular/*` packages are ESM only.
    if (namespaceObject.default) {
        return namespaceObject.default;
    } else {
        return namespaceObject;
    }
}
