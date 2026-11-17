import ts from 'typescript';
import type { ExternalApiPage } from '../rendering/entry-point';

/** The kind of a declaration, as RxJS puts it in the address of its page. */
type DeclarationKind = 'class' | 'interface' | 'type-alias' | 'enum' | 'function' | 'const';

type DocsUrl = (name: string, kind: DeclarationKind) => string;

type DocsSite = {
    /** The modules it documents; the group the pattern captures is the entry point. */
    module: RegExp;
    /** The address of a declaration in the documentation of the major version of its library. */
    url: (major: number, entryPoint: string, name: string, kind: DeclarationKind) => string;
};

/** The major version of RxJS rxjs.dev documents, the latest: an older one has a site of its own, `v6.rxjs.dev`. */
const RXJS_DOCS_MAJOR = 7;

/** The packages of the framework angular.dev documents: not Angular Material, nor the tooling. */
const ANGULAR_DOCS_PACKAGES = [
    'animations',
    'aria',
    'common',
    'core',
    'elements',
    'forms',
    'localize',
    'platform-browser',
    'platform-browser-dynamic',
    'platform-server',
    'router',
    'service-worker',
    'ssr',
    'upgrade'
];

/**
 * The sites documenting the libraries the types name. Angular and its CDK keep each major version on a site of its
 * own, which stays as it is when the next one comes out, and so the links of a published version of these docs do too.
 * The CDK documents a declaration in a section of the page of its entry point, RxJS on a page whose address names its
 * kind, apart from an enum. `rxjs/operators` only repeats the operators of `rxjs`.
 */
const DOCS_SITES: DocsSite[] = [
    {
        module: /^@angular\/cdk\/(.+)$/,
        url: (major, entryPoint, name) => `https://v${major}.material.angular.dev/cdk/${entryPoint}/api#${name}`
    },
    {
        module: new RegExp(`^@angular/((?:${ANGULAR_DOCS_PACKAGES.join('|')})(?:/.+)?)$`),
        url: (major, entryPoint, name) => `https://v${major}.angular.dev/api/${entryPoint}/${name}`
    },
    {
        module: /^rxjs$/,
        url: (major, _, name, kind) => {
            if (major !== RXJS_DOCS_MAJOR) throw new Error(`rxjs.dev documents RxJS ${RXJS_DOCS_MAJOR}, not ${major}`);

            return `https://rxjs.dev/api/index/${kind === 'enum' ? '' : `${kind}/`}${name}`;
        }
    }
];

/** An entry point the documentation leaves out, such as `@angular/cdk/observers/private`. */
const PRIVATE_MODULE = /\/(private|internal)(\/|$)/;

function getDocsSite(module: string): { site: DocsSite; entryPoint: string } | undefined {
    if (PRIVATE_MODULE.test(module)) return undefined;

    for (const site of DOCS_SITES) {
        const match = site.module.exec(module);

        if (match) return { site, entryPoint: match[1] };
    }

    return undefined;
}

/** The major version of the package a module is resolved from, which its documentation is chosen by. */
function getMajorVersion(program: ts.Program, sourceFile: ts.SourceFile, specifier: ts.StringLiteral): number {
    const { resolvedModule } = ts.resolveModuleName(
        specifier.text,
        sourceFile.fileName,
        program.getCompilerOptions(),
        ts.sys,
        undefined,
        undefined,
        program.getModeForUsageLocation(sourceFile, specifier)
    );
    const version = resolvedModule?.packageId?.version;

    if (!version) throw new Error(`Unknown version of "${specifier.text}", which its documentation is chosen by`);

    return Number.parseInt(version, 10);
}

function getKind({ flags }: ts.Symbol): DeclarationKind | undefined {
    if (flags & ts.SymbolFlags.Class) return 'class';
    if (flags & ts.SymbolFlags.Interface) return 'interface';
    if (flags & ts.SymbolFlags.TypeAlias) return 'type-alias';
    if (flags & ts.SymbolFlags.Enum) return 'enum';
    if (flags & ts.SymbolFlags.Function) return 'function';
    if (flags & ts.SymbolFlags.Variable) return 'const';

    return undefined;
}

/** Left out of the documentation of its library: `@docs-private` in the CDK, `@nodoc` in Angular. */
const isUndocumented = ({ declarations = [] }: ts.Symbol): boolean =>
    declarations.some((declaration) =>
        ts.getJSDocTags(declaration).some(({ tagName }) => tagName.text === 'docs-private' || tagName.text === 'nodoc')
    );

/**
 * Where the declarations of Angular, its CDK and RxJS are documented for the installed versions, by their names: every
 * export of the modules of these libraries the sources import, so that a type the compiler infers, such as `Signal` of
 * `computed()`, counts too.
 * A name the browser or the language declares as well is left out, since `Event` in a type is the DOM's rather than the
 * router's, and so is a name two modules export, which a type does not tell apart.
 */
export function getExternalApiPages(program: ts.Program): Map<string, ExternalApiPage> {
    const checker = program.getTypeChecker();
    const modules = new Map<string, { symbol: ts.Symbol; getUrl: DocsUrl }>();

    for (const sourceFile of program.getSourceFiles()) {
        if (sourceFile.isDeclarationFile) continue;

        for (const statement of sourceFile.statements) {
            const specifier =
                (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) && statement.moduleSpecifier;

            if (!specifier || !ts.isStringLiteral(specifier) || modules.has(specifier.text)) continue;

            const docs = getDocsSite(specifier.text);
            const symbol = docs && checker.getSymbolAtLocation(specifier);

            if (!docs || !symbol) continue;

            const major = getMajorVersion(program, sourceFile, specifier);

            modules.set(specifier.text, {
                symbol,
                getUrl: (name, kind) => docs.site.url(major, docs.entryPoint, name, kind)
            });
        }
    }

    const pages = new Map<string, ExternalApiPage>();
    const ambiguous = new Set<string>();

    for (const { symbol: module, getUrl } of modules.values()) {
        for (const exported of checker.getExportsOfModule(module)) {
            const { name } = exported;
            const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
            const kind = getKind(symbol);

            if (!kind || name.startsWith('ɵ') || isUndocumented(symbol)) continue;

            if (checker.resolveName(name, undefined, ts.SymbolFlags.Type | ts.SymbolFlags.Value, false)) continue;

            if (pages.has(name)) ambiguous.add(name);

            pages.set(name, {
                url: getUrl(name, kind),
                ...((kind === 'function' || kind === 'const') && { isValue: true })
            });
        }
    }

    for (const name of ambiguous) pages.delete(name);

    return pages;
}
