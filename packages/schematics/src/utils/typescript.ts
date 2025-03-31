import ts from 'typescript';

export function forEachClass(
    sourceFile: ts.SourceFile,
    callback: (node: ts.ClassDeclaration | ts.ImportDeclaration) => void
) {
    sourceFile.forEachChild(function walk(node) {
        if (ts.isClassDeclaration(node) || ts.isImportDeclaration(node)) {
            callback(node);
        }
        node.forEachChild(walk);
    });
}
