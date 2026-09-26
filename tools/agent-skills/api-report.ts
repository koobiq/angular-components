import ts from 'typescript';

/** An input or output of a component or directive, under the name templates bind it by. */
export interface ApiMember {
    name: string;
    type: string;
    required: boolean;
    deprecated: boolean;
}

export interface ApiDirective {
    className: string;
    kind: 'component' | 'directive';
    selector: string;
    exportAs: string[];
    inputs: ApiMember[];
    outputs: ApiMember[];
    deprecated: boolean;
}

export interface ApiDeclaration {
    name: string;
    /** Declaration text without `export` and the trailing semicolon, for functions, constants and types. */
    signature: string;
    deprecated: boolean;
}

export interface ApiEnum {
    name: string;
    values: string[];
    deprecated: boolean;
}

/** The public API of one entry point, read from its API Extractor report. */
export interface ApiReport {
    directives: ApiDirective[];
    modules: ApiDeclaration[];
    services: ApiDeclaration[];
    classes: ApiDeclaration[];
    enums: ApiEnum[];
    functions: ApiDeclaration[];
    constants: ApiDeclaration[];
    types: ApiDeclaration[];
    interfaces: ApiDeclaration[];
}

const REPORT_CODE = /```ts\n([\s\S]*?)```/;

/** Wrappers whose first type argument is what a template binds, e.g. `InputSignal<boolean>`. */
const SIGNAL_WRAPPERS =
    /^(?:InputSignal|InputSignalWithTransform|ModelSignal|OutputEmitterRef|EventEmitter|OutputRef|Observable|Subject)<(.*)>$/s;

/** Namespace imports of the report (`i0.`, `i1.`) mean nothing outside it. */
const cleanType = (text: string): string =>
    text
        .replace(/\bi\d+\./g, '')
        .replace(/\s+/g, ' ')
        .trim();

const unwrapSignal = (text: string): string => {
    const match = text.match(SIGNAL_WRAPPERS);

    if (!match) return text;

    // InputSignalWithTransform<Value, Written> and friends: the bound value is the first argument.
    let depth = 0;

    for (let index = 0; index < match[1].length; index++) {
        const char = match[1][index];

        if (char === '<' || char === '(' || char === '[' || char === '{') depth++;
        if (char === '>' || char === ')' || char === ']' || char === '}') depth--;
        if (char === ',' && depth === 0) return match[1].slice(0, index).trim();
    }

    return match[1].trim();
};

const isDeprecated = (node: ts.Node, sourceText: string): boolean =>
    (ts.getLeadingCommentRanges(sourceText, node.getFullStart()) ?? []).some(({ pos, end }) =>
        sourceText.slice(pos, end).includes('@deprecated')
    );

const literalText = (node: ts.TypeNode | undefined): string | null =>
    node && ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal) ? node.literal.text : null;

const propertyName = (name: ts.PropertyName): string =>
    ts.isStringLiteral(name) || ts.isIdentifier(name) || ts.isPrivateIdentifier(name) ? name.text : name.getText();

/** The type a class member exposes to templates: the value of a signal, the getter's or the setter's type. */
const memberType = (members: ts.NodeArray<ts.ClassElement>, name: string, sourceFile: ts.SourceFile): string => {
    const candidates = members.filter((member) => member.name && propertyName(member.name) === name);
    const getter = candidates.find(ts.isGetAccessorDeclaration);
    const property = candidates.find(ts.isPropertyDeclaration);
    const setter = candidates.find(ts.isSetAccessorDeclaration);
    const typeNode = property?.type ?? getter?.type ?? setter?.parameters[0]?.type;

    return typeNode ? unwrapSignal(cleanType(typeNode.getText(sourceFile))) : 'unknown';
};

const memberDeprecated = (members: ts.NodeArray<ts.ClassElement>, name: string, sourceText: string): boolean =>
    members.some((member) => member.name && propertyName(member.name) === name && isDeprecated(member, sourceText));

const readDirective = (
    declaration: ts.ClassDeclaration,
    metadata: ts.TypeReferenceNode,
    kind: ApiDirective['kind'],
    sourceFile: ts.SourceFile
): ApiDirective => {
    const [, selectorNode, exportAsNode, inputsNode, outputsNode] = metadata.typeArguments ?? [];
    const sourceText = sourceFile.getFullText();
    const exportAs =
        exportAsNode && ts.isTupleTypeNode(exportAsNode)
            ? exportAsNode.elements
                  .map((element) => literalText(element as ts.TypeNode))
                  .filter((name) => name !== null)
            : [];

    const inputs: ApiMember[] =
        inputsNode && ts.isTypeLiteralNode(inputsNode)
            ? inputsNode.members.filter(ts.isPropertySignature).map((signature) => {
                  const property = propertyName(signature.name);
                  const options = signature.type && ts.isTypeLiteralNode(signature.type) ? signature.type : null;
                  const option = (key: string) =>
                      options?.members
                          .filter(ts.isPropertySignature)
                          .find((member) => propertyName(member.name) === key)?.type;
                  const required = option('required');

                  return {
                      name: literalText(option('alias')) ?? literalText(signature.type) ?? property,
                      type: memberType(declaration.members, property, sourceFile),
                      required:
                          !!required &&
                          ts.isLiteralTypeNode(required) &&
                          required.literal.kind === ts.SyntaxKind.TrueKeyword,
                      deprecated: memberDeprecated(declaration.members, property, sourceText)
                  };
              })
            : [];

    const outputs: ApiMember[] =
        outputsNode && ts.isTypeLiteralNode(outputsNode)
            ? outputsNode.members.filter(ts.isPropertySignature).map((signature) => {
                  const property = propertyName(signature.name);

                  return {
                      name: literalText(signature.type) ?? property,
                      type: memberType(declaration.members, property, sourceFile),
                      required: false,
                      deprecated: memberDeprecated(declaration.members, property, sourceText)
                  };
              })
            : [];

    return {
        className: declaration.name?.text ?? '',
        kind,
        selector: literalText(selectorNode) ?? '',
        exportAs,
        inputs,
        outputs,
        deprecated: isDeprecated(declaration, sourceText)
    };
};

/** The static Ivy declaration (`ɵcmp`, `ɵdir`, `ɵmod`, `ɵprov`) a class carries, if any. */
const ivyDeclaration = (declaration: ts.ClassDeclaration, name: string): ts.TypeReferenceNode | null => {
    const member = declaration.members.find(
        (candidate): candidate is ts.PropertyDeclaration =>
            ts.isPropertyDeclaration(candidate) &&
            !!candidate.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
            propertyName(candidate.name) === name
    );

    return member?.type && ts.isTypeReferenceNode(member.type) ? member.type : null;
};

const signatureOf = (node: ts.Node, sourceFile: ts.SourceFile): string =>
    cleanType(
        node
            .getText(sourceFile)
            .replace(/^export\s+(?:declare\s+)?/, '')
            .replace(/;$/, '')
    );

/** Reads the public API of an entry point from its report in `tools/public_api_guard`. */
export const parseApiReport = (report: string): ApiReport => {
    // API Extractor writes the reports with CRLF line endings.
    const code = report.replace(/\r\n/g, '\n').match(REPORT_CODE)?.[1] ?? '';
    const sourceFile = ts.createSourceFile('report.d.ts', code, ts.ScriptTarget.Latest, true);
    const sourceText = sourceFile.getFullText();
    const api: ApiReport = {
        directives: [],
        modules: [],
        services: [],
        classes: [],
        enums: [],
        functions: [],
        constants: [],
        types: [],
        interfaces: []
    };

    for (const statement of sourceFile.statements) {
        const deprecated = isDeprecated(statement, sourceText);

        if (ts.isClassDeclaration(statement) && statement.name) {
            const component = ivyDeclaration(statement, 'ɵcmp');
            const directive = ivyDeclaration(statement, 'ɵdir');
            const declaration = { name: statement.name.text, signature: statement.name.text, deprecated };

            if (component || directive) {
                api.directives.push(
                    readDirective(
                        statement,
                        (component ?? directive)!,
                        component ? 'component' : 'directive',
                        sourceFile
                    )
                );
            } else if (ivyDeclaration(statement, 'ɵmod')) {
                api.modules.push(declaration);
            } else if (ivyDeclaration(statement, 'ɵprov')) {
                api.services.push(declaration);
            } else {
                api.classes.push(declaration);
            }
        } else if (ts.isEnumDeclaration(statement)) {
            api.enums.push({
                name: statement.name.text,
                values: statement.members.map((member) =>
                    member.initializer
                        ? `${propertyName(member.name)} = ${member.initializer.getText(sourceFile)}`
                        : propertyName(member.name)
                ),
                deprecated
            });
        } else if (ts.isFunctionDeclaration(statement) && statement.name) {
            api.functions.push({
                name: statement.name.text,
                signature: signatureOf(statement, sourceFile),
                deprecated
            });
        } else if (ts.isVariableStatement(statement)) {
            for (const variable of statement.declarationList.declarations) {
                api.constants.push({
                    name: variable.name.getText(sourceFile),
                    signature: cleanType(variable.getText(sourceFile)),
                    deprecated
                });
            }
        } else if (ts.isTypeAliasDeclaration(statement)) {
            api.types.push({ name: statement.name.text, signature: signatureOf(statement, sourceFile), deprecated });
        } else if (ts.isInterfaceDeclaration(statement)) {
            api.interfaces.push({ name: statement.name.text, signature: statement.name.text, deprecated });
        }
    }

    return api;
};

/** Every name the entry point exports, for checking the hand-written part of the skill. */
export const exportedNames = (api: ApiReport): string[] => [
    ...api.directives.map(({ className }) => className),
    ...[
        ...api.modules,
        ...api.services,
        ...api.classes,
        ...api.functions,
        ...api.constants,
        ...api.types,
        ...api.interfaces
    ].map(({ name }) => name),
    ...api.enums.map(({ name }) => name)
];

/** Element names and attribute names that the selectors of the entry point match. */
export const selectorNames = (api: ApiReport): { elements: string[]; attributes: string[] } => {
    const elements = new Set<string>();
    const attributes = new Set<string>();

    for (const { selector } of api.directives) {
        for (const part of selector.split(',')) {
            const element = part.trim().match(/^[a-z][a-z0-9-]*/)?.[0];

            if (element) elements.add(element);

            for (const [, attribute] of part.matchAll(/\[([^\]=~|^$*\s]+)/g)) attributes.add(attribute);
        }
    }

    return { elements: [...elements], attributes: [...attributes] };
};

const MAX_SIGNATURE_LENGTH = 200;

const shorten = (text: string): string =>
    text.length > MAX_SIGNATURE_LENGTH ? `${text.slice(0, MAX_SIGNATURE_LENGTH).trimEnd()} ...` : text;

const deprecatedMark = (deprecated: boolean): string => (deprecated ? ' **(deprecated)**' : '');

const renderMembers = (title: string, members: ApiMember[]): string[] => (members.length === 0 ? [] : [
              `${title}:`,
              '',
              ...members.map(
                  ({ name, type, required, deprecated }) =>
                      `- \`${name}: ${shorten(type)}\`${required ? ' (required)' : ''}${deprecatedMark(deprecated)}`
              ),
              ''
          ]);

/** Markdown summary of the public API of an entry point: what templates and TypeScript code can use. */
export const renderApiReport = (api: ApiReport, entryPoint: string): string => {
    const lines: string[] = [];
    const section = (title: string, items: string[]) => {
        if (items.length === 0) return;

        lines.push(`### ${title}`, '', ...items, '');
    };

    for (const directive of api.directives) {
        const exportAs = directive.exportAs.length ? `, exportAs \`${directive.exportAs.join(', ')}\`` : '';

        lines.push(
            `### \`${directive.className}\`${deprecatedMark(directive.deprecated)}`,
            '',
            `${directive.kind === 'component' ? 'Component' : 'Directive'}, selector \`${directive.selector}\`${exportAs}.`,
            '',
            ...renderMembers('Inputs', directive.inputs),
            ...renderMembers('Outputs', directive.outputs)
        );
    }

    section(
        'Enums',
        api.enums.map(
            ({ name, values, deprecated }) =>
                `- \`${name}\`${deprecatedMark(deprecated)}: ${values.map((value) => `\`${value}\``).join(', ')}`
        )
    );
    section(
        'Functions',
        api.functions.map(({ signature, deprecated }) => `- \`${shorten(signature)}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'Constants and injection tokens',
        api.constants.map(({ signature, deprecated }) => `- \`${shorten(signature)}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'Services',
        api.services.map(({ name, deprecated }) => `- \`${name}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'Other classes',
        api.classes.map(({ name, deprecated }) => `- \`${name}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'Types',
        api.types.map(({ signature, deprecated }) => `- \`${shorten(signature)}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'Interfaces',
        api.interfaces.map(({ name, deprecated }) => `- \`${name}\`${deprecatedMark(deprecated)}`)
    );
    section(
        'NgModules',
        api.modules.map(({ name, deprecated }) => `- \`${name}\`${deprecatedMark(deprecated)}`)
    );

    lines.push(
        `Full typings: \`node_modules/@koobiq/components/${entryPoint}/index.d.ts\`. Prefer the standalone components and directives above; the NgModules exist for older code.`
    );

    return lines.join('\n').trim();
};
