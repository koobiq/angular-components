import { Tree } from '@angular-devkit/schematics';
// `@schematics/angular`'s own bundled copy of the TypeScript compiler, not the `typescript` package: the nodes its
// utilities return were created by it, and `SyntaxKind` values differ between versions.
import ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { getDecoratorMetadata } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath, isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { findAppConfig } from '@schematics/angular/utility/standalone/app_config';
import {
    findBootstrapApplicationCall,
    getMainFilePath,
    getSourceFile
} from '@schematics/angular/utility/standalone/util';
import { CONFIG_PROVIDER, CONFIG_TOKEN } from './data';

const nameOf = (node: ts.Expression): string | undefined => {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node)) return node.name.text;

    return undefined;
};

const isNamed = (property: ts.ObjectLiteralElementLike, name: string): boolean =>
    !!property.name &&
    (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
    property.name.text === name;

/**
 * The elements of the `providers` of a configuration or `@NgModule`, none when it declares no providers, or `null` when
 * `addRootProvider` cannot add one to them safely: it would declare `providers` a second time next to a value that is
 * not an array literal, leave an `@NgModule` alone, or override the providers of a spread.
 */
function providersOf(literal: ts.ObjectLiteralExpression): readonly ts.Expression[] | null {
    if (literal.properties.some(ts.isSpreadAssignment)) return null;

    const providers = literal.properties.find((property) => isNamed(property, 'providers'));

    if (!providers) return [];

    return ts.isPropertyAssignment(providers) && ts.isArrayLiteralExpression(providers.initializer)
        ? providers.initializer.elements
        : null;
}

/**
 * The root providers of an application, where `addRootProvider` adds one: `null` when it cannot add one there safely,
 * since it throws on a bootstrap it cannot analyze only after adding the import, and breaks the configuration or does
 * nothing on providers it cannot extend.
 */
export async function findRootProviders(tree: Tree, project: string): Promise<readonly ts.Expression[] | null> {
    try {
        const mainFilePath = await getMainFilePath(tree, project);

        if (isStandaloneApp(tree, mainFilePath)) {
            const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
            const appConfig = findAppConfig(bootstrapCall, tree, mainFilePath);

            // Without a configuration it can read, `addRootProvider` adds one to `bootstrapApplication(App)` only.
            if (!appConfig) return bootstrapCall.arguments.length === 1 ? [] : null;

            return providersOf(appConfig.node);
        }

        const modulePath = getAppModulePath(tree, mainFilePath);
        const [metadata] = getDecoratorMetadata(getSourceFile(tree, modulePath), 'NgModule', '@angular/core');

        return metadata && ts.isObjectLiteralExpression(metadata) ? providersOf(metadata) : null;
    } catch {
        return null;
    }
}

/** Whether a root provider is a highlight.js configuration of the code block. */
export function isHighlightJsConfig(provider: ts.Expression): boolean {
    if (ts.isCallExpression(provider)) return nameOf(provider.expression) === CONFIG_PROVIDER;

    return (
        ts.isObjectLiteralExpression(provider) &&
        provider.properties.some(
            (property) =>
                isNamed(property, 'provide') &&
                ts.isPropertyAssignment(property) &&
                nameOf(property.initializer) === CONFIG_TOKEN
        )
    );
}
