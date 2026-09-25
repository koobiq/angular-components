import { EntryType } from './entities';
import { isDeprecatedEntry } from './entities/categorization';
import { DocEntryRenderable } from './entities/renderables';
import { compareEntries } from './signature';
import { EntryPointContext } from './templates';

/** The first module that is not deprecated — the one to import; none when every one of them is. */
function findBestPrimaryExport(docs: DocEntryRenderable[]): DocEntryRenderable | null {
    for (const doc of docs) {
        if (!isDeprecatedEntry(doc)) {
            return doc;
        }
    }

    return null;
}

/**
 * The page of one entry point: one flat list of entries, ordered by kind and then by name, and the import
 * of its `NgModule`. The module itself is not listed — it only re-exports what the page already shows.
 */
export function getEntryPointContext(
    renderables: DocEntryRenderable[],
    moduleName: string,
    packageName: string
): EntryPointContext {
    const exportedNgModules = renderables.filter((renderable) => renderable.entryType === EntryType.NgModule);
    const ngModuleExport = packageName === 'core' ? null : findBestPrimaryExport(exportedNgModules);

    return {
        primaryExportName: ngModuleExport?.name || '',
        moduleImportPath: `@koobiq/${moduleName}/${packageName}`,
        entries: renderables.filter((renderable) => renderable.entryType !== EntryType.NgModule).sort(compareEntries)
    };
}
