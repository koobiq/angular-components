import ts from 'typescript';

export function forEachClass(sourceFile: ts.SourceFile, callback: (node: ts.ClassDeclaration) => Promise<void>) {
    sourceFile.forEachChild(function walk(node) {
        if (ts.isClassDeclaration(node)) {
            callback(node);
        }
        node.forEachChild(walk);
    });
}

export function canMigrateFile(sourceFile: ts.SourceFile, program: ts.Program): boolean {
    // We shouldn't migrate .d.ts files, files from an external library or type checking files.
    return !(
        sourceFile.fileName.endsWith('.ngtypecheck.ts') ||
        sourceFile.isDeclarationFile ||
        program.isSourceFileFromExternalLibrary(sourceFile)
    );
}

export function updateDecoratorProperty(decorator: ts.Decorator, propertyName: string, newValue: string): ts.Decorator {
    if (ts.isCallExpression(decorator.expression)) {
        const [arg] = decorator.expression.arguments;

        if (ts.isObjectLiteralExpression(arg)) {
            const newProperties = arg.properties.map((prop) => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === propertyName) {
                    return ts.factory.updatePropertyAssignment(
                        prop,
                        prop.name,
                        ts.factory.createNoSubstitutionTemplateLiteral(newValue, newValue)
                    );
                }
                return prop;
            });

            const newArg = ts.factory.updateObjectLiteralExpression(arg, newProperties);
            const newCall = ts.factory.updateCallExpression(
                decorator.expression,
                decorator.expression.expression,
                undefined,
                [newArg]
            );

            return ts.factory.updateDecorator(decorator, newCall);
        }
    }
    return decorator;
}

export function getClassWithUpdatedDecorator(
    node: ts.ClassDeclaration,
    decorator: ts.Decorator,
    updatedDecorator: ts.Decorator
) {
    const nodeDecorators = ts.getDecorators(node) || [];
    const decoratorIndex = nodeDecorators.indexOf(decorator);
    const updatedDecorators = decoratorIndex !== -1 ? [
                  ...nodeDecorators.slice(0, decoratorIndex),
                  updatedDecorator,
                  ...nodeDecorators.slice(decoratorIndex + 1, nodeDecorators.length)] : nodeDecorators;
    const modifiers = node.modifiers ? node.modifiers.filter((modifier) => modifier !== decorator) : [];

    return ts.factory.replaceDecoratorsAndModifiers(node, [...updatedDecorators, ...modifiers]);
}
