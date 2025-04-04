/** WARNING:
 * this is copy of https://github.com/angular/angular/blob/main/packages/compiler/src/ml_parser/ast.ts
 * since @angular/compiler and @angular-devkit/schematics
 * are not compatible with each other */
export type MigrationData = { elementName: string; attrs: { from: string; to: string } };

export function visitAll(visitor, nodes): any[] {
    const result: any[] = [];

    const visit = visitor.visit
        ? (ast: Element) => visitor.visit!(ast) || ast.visit(visitor)
        : (ast: Element) => ast.visit(visitor);
    nodes.forEach((ast) => {
        visit(ast);
    });
    return result;
}

export interface ParseSourceFile {
    content: string;
    url: string;
}

export interface ParseLocation {
    file: ParseSourceFile;
    offset: number;
    line: number;
    col: number;
}

export interface Element {
    name: string;
    attrs: Attribute[];
    children: Element[];
    /**
     * actual code from angular/compiler:
     * override visit(visitor: Visitor, context: any): any {
     *   return visitor.visitElement(this, context);
     * }
     */
    visit(visitor: any, context?: any): any;
}

export interface Attribute {
    name: string;
    value: string;
    valueTokens: any[];
    keySpan: any;
    valueSpan: { start: ParseLocation; end: ParseLocation; fullStart: any; details: any };
}

export interface Block {
    name: string;
    children: Element[];
    visit(visitor: Visitor, context: any): any;
}

export interface Visitor {
    // Returning a truthy value from `visit()` will prevent `visitAll()` from the call to the typed
    // method and result returned will become the result included in `visitAll()`s result array.
    visit?(node: Node, context: any): any;

    visitElement(element: Element, context: any): any;
    visitAttribute(attribute: Attribute, context: any): any;
    visitText(text: Text, context: any): any;
    visitComment(comment: Comment, context: any): any;
    visitExpansion(expansion: any, context: any): any;
    visitExpansionCase(expansionCase: any, context: any): any;
    visitBlock(block: any, context: any): any;
    visitBlockParameter(parameter: any, context: any): any;
    visitLetDeclaration(decl: any, context: any): any;
}

// attr can be naked or in [ ]
// attr.value can be {{ value }} , 'value'
export function getSimpleAttributeName(attrName: string): string {
    return attrName.replace(/[\[\]]/g, '');
}

export function getSimpleAttributeValue(attrValue: string): string {
    return attrValue.replace(/[{}']/g, '');
}
