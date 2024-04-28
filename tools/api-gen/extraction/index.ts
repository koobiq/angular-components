import { basename, join } from 'path';
import ts from 'typescript';
import { NgtscProgram } from '@angular/compiler-cli';

// @ts-ignore
import { src } from '../utils.js';
// @ts-ignore
import { PackageMetadata, EntryCollection, ClassEntryMetadata } from '../types/types.js';
import { entryHandler, updateEntries, prepareMergedMetadata } from './helpers.js';


const getMetadataFrom = (moduleName: string, packageName: string): PackageMetadata => {
    const entryPointPath = `${moduleName}/${packageName}`;
    const entryPointIndexPath = `packages/${entryPointPath}/index.ts`;

    return { tsCompilerPath: `@koobiq/${entryPointPath}`, resolvedPath: entryPointIndexPath, packageName }
}

export function extractApiToJson() {
    /** List of CDK packages that need to be documented. */
    const cdk: PackageMetadata[] = src(join('packages', 'cdk', '!(testing)/'))
        .map((packagePath: string) => basename(packagePath))
        .map((packageName: string) => getMetadataFrom('cdk', packageName));

    /** List of koobiq packages that need to be documented. */
    const components: PackageMetadata[] = src(join('packages', 'components', '*/'))
        .map((packagePath: string) => basename(packagePath))
        .map((packageName: string) => getMetadataFrom('components', packageName));

    const modules = { cdk, components };

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
            packagesApiInfo: packageMetadataList
                .map(({ resolvedPath, packageName }) => {
                    const classesMetadata: Record<string, ClassEntryMetadata> = src(
                        join('packages', moduleName, packageName, '!(spec|index|public-api).ts')
                    ).reduce<Record<string, ClassEntryMetadata>>(
                        (res, currentPath: string) => ({
                            ...res,
                            ...entryHandler(currentPath)
                        }), {});

                    return {
                        packageName,
                        entries: updateEntries(program.getApiDocumentation(resolvedPath), classesMetadata)
                    }
                })
        } as EntryCollection);
    }

    return output;
}
