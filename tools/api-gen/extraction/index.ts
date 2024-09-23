import { NgtscProgram } from '@angular/compiler-cli';
import { basename, join } from 'path';
import ts from 'typescript';
import { DocEntry } from '../rendering/entities';
import { ClassEntryMetadata, EntryCollection, ModuleInfo, PackageMetadata } from '../types';
import { src } from '../utils';
import { entryHandler, prepareMergedMetadata, updateEntries } from './helpers';

const BASE_PATH = process.env.BASE_PATH ?? 'packages';

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
        emitDecoratorMetadata: true
    };

    // Create a compiler host and program
    const compilerHost: ts.CompilerHost = ts.createCompilerHost(compilerOptions);
    const program = new NgtscProgram(rootNames, compilerOptions, compilerHost);

    // Get API documentation entries for modules
    const output: EntryCollection[] = [];
    for (const [moduleName, packageMetadataList] of Object.entries(modules)) {
        output.push({
            moduleName,
            packagesApiInfo: packageMetadataList.map(({ resolvedPath, packageName }) => {
                const classesMetadata: Record<string, ClassEntryMetadata> = src(
                    join('packages', moduleName, packageName, '!(spec|index|public-api).ts')
                ).reduce<Record<string, ClassEntryMetadata>>(
                    (res, currentPath: string) => ({
                        ...res,
                        ...entryHandler(currentPath)
                    }),
                    {}
                );

                return {
                    packageName,
                    entries: updateEntries(
                        program.getApiDocumentation(resolvedPath, new Set<string>([])).entries as DocEntry[],
                        classesMetadata
                    )
                };
            })
        } as EntryCollection);
    }

    return output;
}
