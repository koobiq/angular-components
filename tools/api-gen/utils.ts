import { access, mkdir } from 'fs/promises';
import glob from 'glob';
import ts from 'typescript';
import { MemberEntryRenderable, PropertyEntryRenderable } from './rendering/entities/renderables';

export const src = (path: string | string[]): string[] => {
    let res: string[];

    if (Array.isArray(path)) {
        res = path.reduce((result: string[], curPath) => {
            const files: string[] = new glob.GlobSync(curPath).found;

            result.push(...files);

            return result;
        }, []);
    } else {
        res = new glob.GlobSync(path).found;
    }

    return res;
};

export const createDirIfNotExists = (dir: string) =>
    access(dir)
        .then(() => undefined)
        .catch(() => mkdir(dir, { recursive: true }));

/**
 * Determines the component or directive metadata from the specified Dgeni class doc. The resolved
 * directive metadata will be stored in a Map.
 *
 * Currently only string literal assignments and array literal assignments are supported. Other
 * value types are not necessary because they are not needed for any user-facing documentation.
 *
 * ```ts
 * @Component({
 *   inputs: ["red", "blue"],
 *   exportAs: "test"
 * })
 * export class MyComponent {}
 * ```
 */
export function getDirectiveMetadata(classPath: ts.SourceFile): Map<string, any> | null {
    // TODO: update with new interface
    const declaration: ts.Node = classPath;

    const decorators = declaration && ts.isClassDeclaration(declaration) ? ts.getDecorators(declaration) : null;

    if (!decorators?.length) {
        return null;
    }

    const expression = decorators
        .filter((decorator: any) => decorator.expression && ts.isCallExpression(decorator.expression))
        .map((decorator: any) => decorator.expression as ts.CallExpression)
        .find(
            (callExpression: any) =>
                callExpression.expression.getText() === 'Component' ||
                callExpression.expression.getText() === 'Directive'
        );

    if (!expression) {
        return null;
    }

    // The argument length of the CallExpression needs to be exactly one, because it's the single
    // JSON object in the @Component/@Directive decorator.
    if (expression.arguments.length !== 1) {
        return null;
    }

    const objectExpression = expression.arguments[0] as ts.ObjectLiteralExpression;
    const resultMetadata = new Map<string, any>();

    (objectExpression.properties as ts.NodeArray<ts.PropertyAssignment>).forEach((prop) => {
        // Support ArrayLiteralExpression assignments in the directive metadata.
        if (prop.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
            const arrayData = (prop.initializer as ts.ArrayLiteralExpression).elements.map(
                (literal) => (literal as ts.StringLiteral).text
            );

            resultMetadata.set(prop.name.getText(), arrayData);
        }

        // Support normal StringLiteral and NoSubstitutionTemplateLiteral assignments
        if (
            prop.initializer.kind === ts.SyntaxKind.StringLiteral ||
            prop.initializer.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral
        ) {
            resultMetadata.set(prop.name.getText(), (prop.initializer as ts.StringLiteral).text);
        }
    });

    return resultMetadata;
}

/** Sorts method members by deprecated status, member decorator, and name. */
export function sortCategorizedMethodMembers(methodEntryA: MemberEntryRenderable, docB: MemberEntryRenderable) {
    // Sort deprecated docs to the end
    if (!methodEntryA.isDeprecated && docB.isDeprecated) {
        return -1;
    }

    if (methodEntryA.isDeprecated && !docB.isDeprecated) {
        return 1;
    }

    // Break ties by sorting alphabetically on the name
    if (methodEntryA.name < docB.name) {
        return -1;
    }

    if (methodEntryA.name > docB.name) {
        return 1;
    }

    return 0;
}

/** Sorts property members by deprecated status, member decorator, and name. */
export function sortCategorizedPropertyMembers(
    propertyEntryA: PropertyEntryRenderable,
    propertyEntryB: PropertyEntryRenderable
) {
    // Sort deprecated docs to the end
    if (!propertyEntryA.isDeprecated && propertyEntryB.isDeprecated) {
        return -1;
    }

    if (propertyEntryA.isDeprecated && !propertyEntryB.isDeprecated) {
        return 1;
    }

    // Sort in the order of: Inputs, Outputs, neither
    if (
        (propertyEntryA.isDirectiveInput && !propertyEntryB.isDirectiveInput) ||
        (propertyEntryA.isDirectiveOutput && !propertyEntryB.isDirectiveInput && !propertyEntryB.isDirectiveOutput)
    ) {
        return -1;
    }

    if (
        (propertyEntryB.isDirectiveInput && !propertyEntryA.isDirectiveInput) ||
        (propertyEntryB.isDirectiveOutput && !propertyEntryA.isDirectiveInput && !propertyEntryA.isDirectiveOutput)
    ) {
        return 1;
    }

    // Break ties by sorting alphabetically on the name
    if (propertyEntryA.name < propertyEntryB.name) {
        return -1;
    }

    if (propertyEntryA.name > propertyEntryB.name) {
        return 1;
    }

    return 0;
}
