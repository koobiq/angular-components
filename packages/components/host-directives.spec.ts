import { CssSelector } from '@angular/compiler';
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import ts from 'typescript';

/** A binding that a host re-exposes from one of its `hostDirectives`. */
interface ForwardedBinding {
    /** `file:line` of the `hostDirectives` entry. */
    location: string;
    host: string;
    directive: string;
    selector: string;
    /** The name a template binds on the host. */
    name: string;
}

interface HostDirectivesScan {
    bindings: ForwardedBinding[];
    /** `file:line: source` of whatever cannot be read statically, and so escapes the check. */
    unreadable: string[];
}

// Resolving the directives takes a TypeScript program over the library.
jest.setTimeout(20_000);

const libraryRoot = __dirname;
const repositoryRoot = join(libraryRoot, '../..');

const librarySources = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) return librarySources(path);

        return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && entry.name !== 'e2e.ts' ? [path] : [];
    });

const compilerOptions = (): ts.CompilerOptions => {
    const tsconfig = join(repositoryRoot, 'tsconfig.json');
    const { config } = ts.parseConfigFileTextToJson(tsconfig, readFileSync(tsconfig, 'utf8'));

    return ts.convertCompilerOptionsFromJson(config.compilerOptions, repositoryRoot).options;
};

const property = (literal: ts.ObjectLiteralExpression | undefined, name: string): ts.Expression | undefined =>
    literal?.properties.find(
        (member): member is ts.PropertyAssignment =>
            ts.isPropertyAssignment(member) && ts.isIdentifier(member.name) && member.name.text === name
    )?.initializer;

const metadataOf = (declaration: ts.ClassDeclaration): ts.ObjectLiteralExpression | undefined =>
    ts
        .getDecorators(declaration)
        ?.map(({ expression }) => expression)
        .filter(ts.isCallExpression)
        .find(({ expression }) => ts.isIdentifier(expression) && ['Component', 'Directive'].includes(expression.text))
        ?.arguments.find(ts.isObjectLiteralExpression);

const classDeclarationOf = (checker: ts.TypeChecker, reference: ts.Expression): ts.ClassDeclaration | undefined => {
    const symbol = checker.getSymbolAtLocation(reference);
    const target = symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;

    return target?.declarations?.find(ts.isClassDeclaration);
};

/** Reads the selector from the decorator in source, or from the `ɵdir` type of a compiled library. */
const selectorOf = (declaration: ts.ClassDeclaration): string | undefined => {
    const metadata = metadataOf(declaration);

    if (metadata) {
        const selector = property(metadata, 'selector');

        if (!selector) return '';

        return ts.isStringLiteralLike(selector) ? selector.text : undefined;
    }

    const definition = declaration.members.find(
        (member): member is ts.PropertyDeclaration =>
            ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name) && member.name.text === 'ɵdir'
    );
    const selector = definition?.type && ts.isTypeReferenceNode(definition.type) && definition.type.typeArguments?.[1];

    return selector && ts.isLiteralTypeNode(selector) && ts.isStringLiteral(selector.literal)
        ? selector.literal.text
        : undefined;
};

/** Attribute names the selector requires, not counting those under `:not()`. */
const attributesOf = (selector: string): string[] =>
    CssSelector.parse(selector).flatMap(({ attrs }) => attrs.filter((_, index) => index % 2 === 0));

const scanHostDirectives = (): HostDirectivesScan => {
    const files = librarySources(libraryRoot).filter((file) => readFileSync(file, 'utf8').includes('hostDirectives'));
    const program = ts.createProgram(files, { ...compilerOptions(), types: [] });
    const checker = program.getTypeChecker();
    const bindings: ForwardedBinding[] = [];
    const unreadable: string[] = [];

    for (const file of files) {
        const source = program.getSourceFile(file)!;
        const locationOf = (node: ts.Node): string =>
            `${relative(libraryRoot, file).replace(/\\/g, '/')}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
        const reportUnreadable = (node: ts.Node): void => {
            unreadable.push(`${locationOf(node)}: ${node.getText()}`);
        };
        const elementsOf = (node: ts.Expression | undefined): readonly ts.Expression[] => {
            if (!node) return [];

            if (ts.isArrayLiteralExpression(node)) return node.elements;

            reportUnreadable(node);

            return [];
        };

        for (const host of source.statements.filter(ts.isClassDeclaration)) {
            for (const entry of elementsOf(property(metadataOf(host), 'hostDirectives'))) {
                // A directive listed on its own forwards no binding.
                if (ts.isIdentifier(entry)) continue;

                if (!ts.isObjectLiteralExpression(entry)) {
                    reportUnreadable(entry);
                    continue;
                }

                const names: string[] = [];

                for (const binding of [
                    ...elementsOf(property(entry, 'inputs')),
                    ...elementsOf(property(entry, 'outputs'))
                ]) {
                    if (!ts.isStringLiteralLike(binding)) {
                        reportUnreadable(binding);
                        continue;
                    }

                    // `'name'` or `'name: alias'`.
                    const [name, alias] = binding.text.split(':').map((part) => part.trim());

                    names.push(alias || name);
                }

                if (names.length === 0) continue;

                const directive = property(entry, 'directive')!;
                const declaration = classDeclarationOf(checker, directive);
                const selector = declaration && selectorOf(declaration);

                if (selector === undefined) {
                    reportUnreadable(directive);
                    continue;
                }

                for (const name of names) {
                    bindings.push({
                        location: locationOf(entry),
                        host: host.name!.text,
                        directive: directive.getText(),
                        selector,
                        name
                    });
                }
            }
        }
    }

    return { bindings, unreadable };
};

describe('hostDirectives', () => {
    let scan: HostDirectivesScan;

    beforeAll(() => {
        scan = scanHostDirectives();
    });

    it('should read every forwarded binding and the selector of its directive statically', () => {
        expect(scan.bindings).not.toHaveLength(0);
        expect(scan.unreadable).toEqual([]);
    });

    // Written on the host, such a binding also matches the carried directive wherever that directive is imported:
    // NG0309 in dev mode, a silent second instance in production.
    it('should not forward a binding under an attribute name of the directive selector', () => {
        expect(
            scan.bindings
                .filter(({ selector, name }) => attributesOf(selector).includes(name))
                .map(
                    ({ location, host, name, directive }) =>
                        `${location}: ${host} exposes a ${directive} binding as "${name}"`
                )
        ).toEqual([]);
    });
});
