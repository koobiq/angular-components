import { ClassEntryRenderable, DocEntryRenderable } from './entities/renderables.mjs';
import { isClassEntry, isDeprecatedEntry } from './entities/categorization.mjs';
import { EntryType } from './entities.mjs';

export const isClass = (renderable: DocEntryRenderable) => {
    return isClassEntry(renderable) && renderable.entryType === EntryType.UndecoratedClass
        && !(renderable as ClassEntryRenderable).isService;
}

export const isDirective = (renderable: DocEntryRenderable): boolean => {
    return renderable.entryType === EntryType.Component ||
        renderable.entryType === EntryType.Directive;
}

export function findBestPrimaryExport(docs: DocEntryRenderable[]): DocEntryRenderable | null {
    // Usually the first doc that is not deprecated is used, but in case there are
    // only deprecated doc, the last deprecated doc is used. We don't want to always
    // skip deprecated docs as they could be still needed for documentation of a
    // deprecated entry-point.
    for (const doc of docs) {
        if (!isDeprecatedEntry(doc)) { return doc; }
    }

    return null;
}

export function entryPointGrouper(renderables: DocEntryRenderable[], moduleName: string, packageName: string) {
    const packageDisplayName = moduleName === 'cdk' ? 'CDK' : 'Koobiq';
    const moduleImportPath = `@koobiq/${moduleName}/${packageName}`;
    const exportedNgModules = renderables.filter((renderable) => renderable.entryType === EntryType.NgModule);
    const ngModuleExport = findBestPrimaryExport(exportedNgModules);

    return {
        primaryExportName: ngModuleExport?.name || '',
        displayName: packageName,
        moduleImportPath,
        packageDisplayName,
        exportedNgModules,
        directives: renderables.filter(isDirective),
        classes: renderables.filter(isClass),
        interfaces: renderables.filter((renderable) => renderable.entryType === EntryType.Interface),
        typeAliases: renderables.filter((renderable) => renderable.entryType === EntryType.TypeAlias),
        constants: renderables.filter((renderable) => renderable.entryType === EntryType.Constant),
        functions: renderables.filter((renderable) => renderable.entryType === EntryType.Function),
        services: renderables.filter((renderable) => isClassEntry(renderable) && renderable.isService),
    }
}
