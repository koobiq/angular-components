import { DocEntry } from './entities';
import {
    isClassEntry,
    isConstantEntry,
    isEnumEntry,
    isFunctionEntry,
    isInterfaceEntry,
    isTypeAliasEntry
} from './entities/categorization';
import { DocEntryRenderable } from './entities/renderables';
import { getClassRenderable } from './transforms/class-transforms';
import { getConstantRenderable } from './transforms/constant-transforms';
import { getEnumRenderable } from './transforms/enum-transforms';
import { getFunctionRenderable } from './transforms/function-transforms';
import { getInterfaceRenderable } from './transforms/interface-transforms';
import {
    addHtmlAdditionalLinks,
    addHtmlDescription,
    addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './transforms/jsdoc-transforms';
import { addModuleName } from './transforms/module-name';
import { getTypeAliasRenderable } from './transforms/type-alias-transforms';

export function getRenderable(entry: DocEntry, moduleName: string): DocEntryRenderable {
    if (isClassEntry(entry)) {
        return getClassRenderable(entry, moduleName);
    }

    if (isConstantEntry(entry)) {
        return getConstantRenderable(entry, moduleName);
    }

    if (isEnumEntry(entry)) {
        return getEnumRenderable(entry, moduleName);
    }

    if (isInterfaceEntry(entry)) {
        return getInterfaceRenderable(entry, moduleName);
    }

    if (isFunctionEntry(entry)) {
        return getFunctionRenderable(entry, moduleName);
    }

    if (isTypeAliasEntry(entry)) {
        return getTypeAliasRenderable(entry, moduleName);
    }

    // Fallback to an uncategorised renderable.
    return setEntryFlags(
        addHtmlAdditionalLinks(
            addHtmlDescription(addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(entry, moduleName))))
        )
    );
}
