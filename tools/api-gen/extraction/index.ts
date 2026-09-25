import { NgtscProgram } from '@angular/compiler-cli';
import { basename, join } from 'path';
import ts from 'typescript';
import { ConstantEntry, DocEntry, EntryType } from '../rendering/entities';
import { ClassEntryMetadata, DeclarationSourceMetadata, EntryCollection, ModuleInfo, PackageMetadata } from '../types';
import { src } from '../utils';
import { prepareMergedMetadata, readSourceFile, updateEntries } from './helpers';

const BASE_PATH = process.env.BASE_PATH ?? 'packages';

const mergeRecords = <T>(records: Record<string, T>[]): Record<string, T> => Object.assign({}, ...records);

function findVariableDeclaration(sourceFile: ts.SourceFile, name: string): ts.VariableDeclaration | undefined {
    return sourceFile.statements
        .filter(ts.isVariableStatement)
        .flatMap(({ declarationList }) => [...declarationList.declarations])
        .find((declaration) => ts.isIdentifier(declaration.name) && ts.idText(declaration.name) === name);
}

/**
 * The type of a constant without an annotation, in full. Angular's extractor prints it with `typeToString`,
 * which cuts a long object type short — `{ a11y: {...; ... 8 more ...; }; ... 14 more ...; }` — where the
 * typings, and so the signature, write every property out.
 */
function withFullConstantTypes(entries: DocEntry[], program: NgtscProgram): DocEntry[] {
    const tsProgram = program.getTsProgram();
    const checker = tsProgram.getTypeChecker();
    const printer = ts.createPrinter({ removeComments: true });

    return entries.map((entry) => {
        const { type, source } = entry as ConstantEntry & { source?: { filePath: string } };

        if (entry.entryType !== EntryType.Constant || !type?.includes('...') || !source) return entry;

        const sourceFile = tsProgram.getSourceFile(join(process.cwd(), source.filePath));
        const declaration = sourceFile && findVariableDeclaration(sourceFile, entry.name);
        const typeNode =
            declaration &&
            checker.typeToTypeNode(
                checker.getTypeAtLocation(declaration.name),
                declaration,
                ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.MultilineObjectLiterals
            );

        return typeNode ? { ...entry, type: printer.printNode(ts.EmitHint.Unspecified, typeNode, sourceFile) } : entry;
    });
}

const getMetadataFrom = (moduleName: string, packageName: string): PackageMetadata => {
    const entryPointPath = `${moduleName}/${packageName}`;
    const entryPointIndexPath = `${BASE_PATH}/${entryPointPath}/index.ts`;

    return { tsCompilerPath: `@koobiq/${entryPointPath}`, resolvedPath: entryPointIndexPath, packageName };
};

const getModulePackagePaths = ({ moduleName, include, exclude }: ModuleInfo): string[] => {
    let rule: string = '*/';

    if (include) {
        rule = `(${include.join('|')})/`;
    } else if (exclude) {
        rule = `!(${exclude.join('|')})/`;
    }

    return src(join(BASE_PATH, moduleName, rule));
};

export function extractApiToJson(packages: ModuleInfo[]) {
    const modules: { [moduleName: string]: PackageMetadata[] } = packages.reduce((res, current) => {
        res[current.moduleName] = getModulePackagePaths(current)
            .map((packagePath: string) => basename(packagePath))
            .map((packageName: string) => getMetadataFrom(current.moduleName, packageName));

        return res;
    }, {});

    // Retrieve source TypeScript files for API reference extraction
    const { paths, rootNames } = prepareMergedMetadata(modules);

    // Define compiler options
    const compilerOptions: ts.CompilerOptions = {
        // paths: resolvedPathMap,
        paths,
        rootDir: '.',
        skipLibCheck: true,
        target: ts.ScriptTarget.Latest,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        module: ts.ModuleKind.ESNext,
        experimentalDecorators: true,
        composite: true,
        emitDecoratorMetadata: true,
        // Without it the checker drops `null` and `undefined` from every union it prints, and a type such as
        // `boolean | null` — where `null` means "decide automatically" — reads as a plain `boolean`.
        strictNullChecks: true
    };

    // Create a compiler host and program
    const compilerHost: ts.CompilerHost = ts.createCompilerHost(compilerOptions);
    const program = new NgtscProgram(rootNames, compilerOptions, compilerHost);

    // Get API documentation entries for modules.
    //
    // Two passes. A host directive routinely lives in another package — state saving is in `core`, the
    // components applying it are not — so the inputs it surfaces on its hosts can only be merged once
    // every package has been extracted.
    const extracted = Object.entries(modules).map(([moduleName, packageMetadataList]) => ({
        moduleName,
        packages: packageMetadataList.map(({ resolvedPath, packageName }) => {
            // Nested directories too: `core` keeps its classes in subdirectories, and a host directive or a base
            // class found nowhere cannot contribute its inputs or members to the classes using it.
            const sources = src(
                join('packages', moduleName, packageName, '**', '!(*.spec|*.playwright-spec|e2e|index|public-api).ts')
            ).map(readSourceFile);

            return {
                packageName,
                classesMetadata: mergeRecords(sources.map(({ classes }) => classes)),
                declarations: mergeRecords(sources.map(({ declarations }) => declarations)),
                entries: withFullConstantTypes(
                    program.getApiDocumentation(resolvedPath, new Set<string>([])).entries as DocEntry[],
                    program
                )
            };
        })
    }));

    const entriesByName: Record<string, DocEntry> = {};
    const metadataByName: Record<string, ClassEntryMetadata> = {};
    const declarationsByName: Record<string, DeclarationSourceMetadata> = {};

    for (const { packages } of extracted) {
        for (const { entries, classesMetadata, declarations } of packages) {
            for (const entry of entries) entriesByName[entry.name] ??= entry;

            for (const [name, metadata] of Object.entries(classesMetadata)) metadataByName[name] ??= metadata;

            for (const [name, declaration] of Object.entries(declarations)) declarationsByName[name] ??= declaration;
        }
    }

    return extracted.map(
        ({ moduleName, packages }) =>
            ({
                moduleName,
                packagesApiInfo: packages.map(({ packageName, entries, classesMetadata, declarations }) => ({
                    packageName,
                    // A package's own declarations first: an unexported helper elsewhere may share an exported name.
                    entries: updateEntries(entries, classesMetadata, entriesByName, metadataByName, {
                        ...declarationsByName,
                        ...declarations
                    })
                }))
            }) as EntryCollection
    );
}
